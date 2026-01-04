/**
 * Vercel Serverless Function: Zone 5 Contribution Graph Generator
 * Generates GitHub-style contribution graph showing daily Zone 5 training
 * Goal: 15+ minutes per day in Zone 5 (171-190 bpm)
 */

const fs = require('fs');
const path = require('path');

// GitHub contribution graph colors
const COLORS = {
  BACKGROUND: '#0d1117',
  BORDER: '#30363d',
  EMPTY: '#161b22',
  LEVEL_1: '#0e4429',  // 1-7 min
  LEVEL_2: '#006d32',  // 8-14 min
  LEVEL_3: '#26a641',  // 15-22 min (goal met!)
  LEVEL_4: '#39d353',  // 23+ min (excellent!)
  TEXT: '#e6edf3'
};

/**
 * Get color based on Zone 5 minutes
 */
function getColorForMinutes(minutes) {
  if (minutes === 0) return COLORS.EMPTY;
  if (minutes < 8) return COLORS.LEVEL_1;
  if (minutes < 15) return COLORS.LEVEL_2;
  if (minutes < 23) return COLORS.LEVEL_3;
  return COLORS.LEVEL_4;
}

/**
 * Generate contribution graph data for the past year
 */
function generateGraphData(zone5Data) {
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // 52 weeks = 364 days

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let currentDate = new Date(startDate);
  let currentWeek = [];

  for (let i = 0; i < 371; i++) { // 53 weeks max
    const dateStr = currentDate.toISOString().split('T')[0];
    const minutes = zone5Data.achievements?.[dateStr] || 0;

    currentWeek.push({
      date: dateStr,
      minutes: minutes,
      color: getColorForMinutes(minutes)
    });

    // New week on Sunday
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', minutes: 0, color: COLORS.BACKGROUND });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Calculate statistics from data
 */
function calculateStats(zone5Data) {
  const achievements = zone5Data.achievements || {};
  const values = Object.values(achievements);

  const totalMinutes = values.reduce((sum, min) => sum + min, 0);
  const daysWithData = values.filter(m => m > 0).length;
  const daysWithGoal = values.filter(m => m >= 15).length;
  const longestStreak = calculateLongestStreak(achievements);
  const currentStreak = calculateCurrentStreak(achievements);

  return {
    totalMinutes,
    daysWithData,
    daysWithGoal,
    longestStreak,
    currentStreak
  };
}

/**
 * Check if two date strings are consecutive days
 */
function areConsecutiveDays(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

/**
 * Calculate longest streak of 15+ minute days
 */
function calculateLongestStreak(achievements) {
  const sortedDates = Object.keys(achievements).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate = null;

  for (const date of sortedDates) {
    if (achievements[date] >= 15) {
      if (previousDate === null || areConsecutiveDays(previousDate, date)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      previousDate = date;
    } else {
      currentStreak = 0;
      previousDate = null;
    }
  }

  return maxStreak;
}

/**
 * Calculate current streak (from today backwards)
 */
function calculateCurrentStreak(achievements) {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (achievements[dateStr] >= 15) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

/**
 * Generate SVG contribution graph
 */
function generateSVG(weeks, stats, theme = 'dark') {
  const cellSize = 12;
  const cellGap = 3;
  const weekWidth = cellSize + cellGap;
  const dayHeight = cellSize + cellGap;

  const graphWidth = weeks.length * weekWidth;
  const graphHeight = 7 * dayHeight + 60; // Extra space for stats
  const totalWidth = graphWidth + 100;
  const totalHeight = graphHeight + 40;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg { fill: ${COLORS.BACKGROUND}; }
    .text { fill: ${COLORS.TEXT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; }
    .title { font-size: 14px; font-weight: 600; }
    .stat { font-size: 11px; }
    .cell { stroke: ${COLORS.BORDER}; stroke-width: 1; }
  </style>

  <!-- Background -->
  <rect class="bg" width="${totalWidth}" height="${totalHeight}" rx="6"/>

  <!-- Title -->
  <text class="text title" x="20" y="25">Zone 5 Training - Last 12 Months</text>

  <!-- Stats -->
  <text class="text stat" x="20" y="45">🔥 ${stats.currentStreak} day streak  •  ⚡ ${stats.totalMinutes} total minutes  •  🎯 ${stats.daysWithGoal} days goal met (15+ min)</text>

  <!-- Contribution Graph -->
  <g transform="translate(20, 60)">
`;

  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0].date;
    if (firstDay) {
      const month = new Date(firstDay).getMonth();
      if (month !== lastMonth && weekIndex > 0) {
        const x = weekIndex * weekWidth;
        svg += `    <text class="text stat" x="${x}" y="-5">${monthLabels[month]}</text>\n`;
        lastMonth = month;
      }
    }
  });

  // Day cells
  weeks.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      const x = weekIndex * weekWidth;
      const y = dayIndex * dayHeight;
      const color = day.color;

      svg += `    <rect class="cell" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}">
      <title>${day.date || 'No data'}: ${day.minutes} minutes in Zone 5</title>
    </rect>\n`;
    });
  });

  svg += `  </g>

  <!-- Legend -->
  <g transform="translate(20, ${graphHeight + 20})">
    <text class="text stat" x="0" y="0">Less</text>
    <rect class="cell" x="35" y="-10" width="10" height="10" rx="2" fill="${COLORS.EMPTY}"/>
    <rect class="cell" x="50" y="-10" width="10" height="10" rx="2" fill="${COLORS.LEVEL_1}"/>
    <rect class="cell" x="65" y="-10" width="10" height="10" rx="2" fill="${COLORS.LEVEL_2}"/>
    <rect class="cell" x="80" y="-10" width="10" height="10" rx="2" fill="${COLORS.LEVEL_3}"/>
    <rect class="cell" x="95" y="-10" width="10" height="10" rx="2" fill="${COLORS.LEVEL_4}"/>
    <text class="text stat" x="110" y="0">More</text>
  </g>
</svg>`;

  return svg;
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
  try {
    const { theme = 'dark' } = req.query;

    // Read zone5 data
    const dataPath = path.join(process.cwd(), 'zone5-data.json');
    let zone5Data = { achievements: {} };

    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      zone5Data = JSON.parse(fileContent);
    } catch (error) {
      console.log('No data file found, using empty data');
    }

    // Generate graph data
    const weeks = generateGraphData(zone5Data);
    const stats = calculateStats(zone5Data);

    // Generate SVG
    const svg = generateSVG(weeks, stats, theme);

    // Return SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error generating contribution graph:', error);
    res.status(500).send('Error generating graph');
  }
};
