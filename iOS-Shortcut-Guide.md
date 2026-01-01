# iOS Shortcut for Zone 5 Tracker

Automate your Zone 5 data upload with just 1 tap on your iPhone!

## 🎯 What This Shortcut Does

1. **Exports** your Health data from iPhone
2. **Processes** heart rate data to calculate Zone 5 minutes
3. **Uploads** to GitHub automatically
4. **Updates** your contribution graph on Vercel

**Result:** One tap → Updated graph! ✨

## 📱 Setup Instructions (5 minutes)

### Step 1: Get Your GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: `Zone5 Tracker iOS`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** - you'll need it for the shortcut!

### Step 2: Install the Shortcut

**Option A: Use the Shortcut Template**

I'll create a shortcut file that you can import. Here's the configuration:

**Shortcut Name:** Update Zone 5 Data

**Actions:**

```
1. Get Health Samples
   - Type: Heart Rate
   - Date Range: Last 365 days
   - Sort by: Start Date

2. Repeat with Each (sample in Health Samples)
   - Get Details of Health Sample
     - Start Date
     - Value (BPM)

3. Filter samples where Value is between 171-190 (Zone 5)

4. Group by Day
   - Count minutes per day in Zone 5

5. Format as JSON
   {
     "lastUpdate": [Current Date ISO],
     "achievements": {
       "2025-12-31": [minutes],
       ...
     }
   }

6. Make API Request to GitHub
   - URL: https://api.github.com/repos/anhsrepo/anhsrepo/contents/zone5-data.json
   - Method: PUT
   - Headers:
     - Authorization: token [YOUR_GITHUB_TOKEN]
     - Accept: application/vnd.github.v3+json
   - Body:
     {
       "message": "Update Zone 5 data from iPhone",
       "content": [Base64 encoded JSON],
       "sha": [file SHA - get first, then update]
     }

7. Show Notification
   "✅ Zone 5 data updated! Check your graph."
```

### Step 3: Manual Shortcut Creation

Since iOS doesn't support direct shortcut import, here's how to create it manually:

1. **Open Shortcuts app** on iPhone
2. **Tap "+" to create new shortcut**
3. **Add these actions in order:**

#### Action 1: Export Health Data
```
Search for: "Find Health Samples"
- Sample Type: Heart Rate
- Limit: 10,000
- Sort by: Start Date (Oldest First)
```

#### Action 2: Get URL Contents (GitHub API - Get Current File)
```
Search for: "Get Contents of URL"
- URL: https://api.github.com/repos/anhsrepo/anhsrepo/contents/zone5-data.json
- Method: GET
- Headers:
  - Authorization: token YOUR_GITHUB_TOKEN_HERE
  - Accept: application/vnd.github.v3+json
- Store as: currentFile
```

#### Action 3: Run JavaScript to Process Data
```
Search for: "Run JavaScript on Web Page"

Paste this code:

function processZone5Data() {
  // Get health samples from Shortcuts
  const samples = input; // Health samples passed from previous action

  // Zone 5 range: 171-190 bpm (age 30)
  const ZONE5_MIN = 171;
  const ZONE5_MAX = 190;

  // Group by date and calculate minutes
  const achievements = {};

  samples.forEach(sample => {
    const bpm = sample.quantity;
    const date = new Date(sample.startDate).toISOString().split('T')[0];

    if (bpm >= ZONE5_MIN && bpm <= ZONE5_MAX) {
      if (!achievements[date]) {
        achievements[date] = 0;
      }
      // Estimate 1 minute per reading
      achievements[date] += 1;
    }
  });

  // Create JSON structure
  const result = {
    "lastUpdate": new Date().toISOString(),
    "zone5Range": "171-190 bpm",
    "maxHeartRate": 190,
    "userAge": 30,
    "dailyGoal": 15,
    "achievements": achievements
  };

  return JSON.stringify(result, null, 2);
}

return processZone5Data();
```

#### Action 4: Base64 Encode
```
Search for: "Base64 Encode"
- Input: [JavaScript Result from previous step]
```

#### Action 5: Upload to GitHub
```
Search for: "Get Contents of URL"
- URL: https://api.github.com/repos/anhsrepo/anhsrepo/contents/zone5-data.json
- Method: PUT
- Headers:
  - Authorization: token YOUR_GITHUB_TOKEN_HERE
  - Accept: application/vnd.github.v3+json
- Request Body: JSON
  {
    "message": "Update Zone 5 data from iPhone 📱",
    "content": [Base64 Result],
    "sha": [Get from currentFile.sha]
  }
```

#### Action 6: Show Result
```
Search for: "Show Notification"
- Title: ✅ Zone 5 Updated!
- Body: Your contribution graph is updating...
```

## 🔧 Simplified Version (Easier to Set Up)

If the above is too complex, use this **simpler approach**:

### Simple Shortcut: Export Only

1. **Export Health Data** to Files
2. **Upload** to iCloud Drive folder
3. **Manual**: Run parser on Mac when convenient

**Steps:**
1. Shortcuts app → New Shortcut
2. Add "Export Health Data"
   - Types: Heart Rate
   - Export to: iCloud Drive/Zone5Data/
3. Add "Show Notification": "Health data exported!"

Then on your Mac:
```bash
# When you see the export in iCloud
python3 scripts/parse-apple-health.py ~/iCloud\ Drive/Zone5Data/export.xml
git add zone5-data.json
git commit -m "Update Zone 5 data"
git push
```

## 📋 Quick Reference

**GitHub Token Scopes Needed:**
- `repo` - Full repository access

**API Endpoint:**
```
PUT https://api.github.com/repos/anhsrepo/anhsrepo/contents/zone5-data.json
```

**Required Headers:**
```
Authorization: token ghp_xxxxxxxxxxxxx
Accept: application/vnd.github.v3+json
Content-Type: application/json
```

## 🎬 Usage

**Once set up:**
1. Tap shortcut on iPhone
2. Allow Health access (first time only)
3. Wait 3-5 seconds
4. See "✅ Zone 5 Updated!" notification
5. Check your GitHub profile - graph updated!

## 🐛 Troubleshooting

**"Authorization failed"**
- Check GitHub token is valid
- Ensure `repo` scope is enabled

**"No health data found"**
- Check Apple Watch is syncing to iPhone
- Verify Health permissions in Settings

**"Rate limit exceeded"**
- GitHub API has limits: 5,000 requests/hour
- Wait a few minutes and try again

## 🔄 Updating Data

**Recommended frequency:**
- **Daily**: After workouts
- **Weekly**: Batch update
- **On-demand**: When you want to show off! 💪

---

**Need help?** Check the full setup guide in ZONE5_SETUP.md

**iOS 18+ Required** | **Apple Watch Recommended**
