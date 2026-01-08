/**
 * Vercel Serverless Function: Health Data Sync Endpoint
 * Receives heart rate data from iOS Shortcut and updates zone5-data.json via GitHub API
 *
 * POST /api/health-sync
 * Body: { heartRates: [{ date: "2024-01-01", bpm: 175 }, ...] }
 *
 * Environment Variables Required:
 * - GITHUB_TOKEN: GitHub personal access token with repo scope
 * - SYNC_SECRET: (optional) Secret for authenticating requests
 */

// Zone 5 Configuration (Age 30)
const ZONE_5_MIN = 171;
const ZONE_5_MAX = 190;
const GITHUB_REPO = 'asrepo1/asrepo1';
const DATA_FILE = 'zone5-data.json';

/**
 * Process heart rate data and calculate Zone 5 minutes per day
 */
function processHeartRates(heartRates) {
  const dailyZone5 = {};

  for (const reading of heartRates) {
    const { date, bpm } = reading;

    if (bpm >= ZONE_5_MIN && bpm <= ZONE_5_MAX) {
      if (!dailyZone5[date]) {
        dailyZone5[date] = 0;
      }
      dailyZone5[date] += 1;
    }
  }

  return dailyZone5;
}

/**
 * Get current file from GitHub
 */
async function getGitHubFile(token) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );

  if (response.status === 404) {
    return { content: null, sha: null };
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  return { content, sha: data.sha };
}

/**
 * Update file on GitHub
 */
async function updateGitHubFile(token, content, sha) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update Zone 5 data from iOS',
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        sha: sha
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub update failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
  // CORS headers for iOS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).json({ error: 'Server not configured. Missing GITHUB_TOKEN.' });
    }

    // Optional auth check
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.SYNC_SECRET;
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { heartRates } = req.body;

    if (!heartRates || !Array.isArray(heartRates)) {
      return res.status(400).json({ error: 'Invalid data. Expected { heartRates: [...] }' });
    }

    // Process heart rates to get Zone 5 minutes per day
    const newAchievements = processHeartRates(heartRates);

    // Get existing data from GitHub
    const { content: existingData, sha } = await getGitHubFile(githubToken);
    const existing = existingData || { achievements: {} };

    // Merge achievements (keep higher values)
    const mergedAchievements = { ...existing.achievements };
    for (const [date, minutes] of Object.entries(newAchievements)) {
      if (!mergedAchievements[date] || minutes > mergedAchievements[date]) {
        mergedAchievements[date] = minutes;
      }
    }

    // Build updated data
    const today = new Date().toISOString().split('T')[0];
    const updatedData = {
      lastUpdate: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
      currentHeartRate: heartRates[heartRates.length - 1]?.bpm || 0,
      inZone5: false,
      todayZone5Minutes: mergedAchievements[today] || 0,
      zone5Range: `${ZONE_5_MIN}-${ZONE_5_MAX} bpm`,
      maxHeartRate: 190,
      userAge: 30,
      achievements: mergedAchievements
    };

    // Update GitHub
    await updateGitHubFile(githubToken, updatedData, sha);

    res.status(200).json({
      success: true,
      message: 'Zone 5 data synced to GitHub!',
      newZone5Days: Object.keys(newAchievements).length,
      totalZone5Days: Object.keys(mergedAchievements).length,
      todayMinutes: updatedData.todayZone5Minutes
    });

  } catch (error) {
    console.error('Error syncing health data:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
