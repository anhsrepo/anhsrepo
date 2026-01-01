# Zone 5 Tracker Setup Guide

Complete guide to setting up your Zone 5 heart rate training tracker with GitHub-style contribution visualization.

## 🎯 What You'll Get

A beautiful contribution graph showing your daily Zone 5 training, displayed on your GitHub profile:

![Zone 5 Badge Example](https://via.placeholder.com/800x200/0d1117/39d353?text=Your+Zone+5+Training+Graph+Will+Appear+Here)

- **Green squares** for each day you train in Zone 5 (171-190 bpm)
- **Darker colors** = more minutes in Zone 5
- **15+ minutes/day** = daily goal met ✅
- **Streaks, totals, and statistics** displayed at the top

## 📋 Prerequisites

- iPhone with Apple Watch
- Apple Health data with heart rate recordings
- GitHub account
- Vercel account (free tier works perfectly)

## 🚀 Quick Start (3 Steps)

### Step 1: Export Your Apple Health Data

1. Open the **Health app** on your iPhone
2. Tap your **profile picture** (top right)
3. Scroll down and tap **"Export All Health Data"**
4. Wait for export to complete (can take a few minutes)
5. **AirDrop** the `export.zip` file to your Mac
6. **Unzip** the file - you'll find `export.xml` inside

### Step 2: Process Your Heart Rate Data

```bash
# Clone this repo
git clone https://github.com/anhsrepo/anhsrepo.git
cd anhsrepo

# Run the parser (replace with your export.xml path)
python3 scripts/parse-apple-health.py ~/Downloads/apple_health_export/export.xml
```

The script will:
- ✅ Extract all heart rate readings from your workouts
- ✅ Calculate Zone 5 minutes for each day (171-190 bpm for age 30)
- ✅ Save results to `zone5-data.json`
- ✅ Show you statistics and streak information

**Example output:**
```
🏃‍♂️ Apple Health Zone 5 Parser
==================================================
📖 Parsing export.xml...
✅ Found 12,456 heart rate records
✅ Found 234 workout records

🔥 Calculating Zone 5 minutes (171-190 bpm)...
  🎯 2025-12-31: 22 minutes (45 readings)
  🎯 2025-12-30: 18 minutes (38 readings)
  🎯 2025-12-29: 25 minutes (52 readings)

💾 Saved to zone5-data.json

📊 Statistics:
  Total days with Zone 5: 45
  Total Zone 5 minutes: 892
  Days meeting goal (15+ min): 32
  Average minutes per day: 19.8

✅ Done! Your Zone 5 data is ready.
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI (if you haven't already)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy your project
vercel --prod
```

Vercel will give you a URL like: `https://your-project.vercel.app`

**Your contribution graph will be available at:**
```
https://your-project.vercel.app/api/zone5-contributions
```

## 📍 Add to Your GitHub Profile

1. Create or edit your GitHub profile README (create a repo with your username)
2. Add this badge:

```markdown
## 🏃‍♂️ Zone 5 Training

![Zone 5 Contributions](https://your-project.vercel.app/api/zone5-contributions)

**Daily Goal:** 15+ minutes at 171-190 bpm (Zone 5)
```

## 🔄 Updating Your Data

Whenever you want to update your contribution graph with new workout data:

```bash
# 1. Export new Apple Health data (see Step 1 above)

# 2. Run the parser again
python3 scripts/parse-apple-health.py ~/Downloads/apple_health_export/export.xml

# 3. Commit and push the updated zone5-data.json
git add zone5-data.json
git commit -m "Update Zone 5 data - $(date +%Y-%m-%d)"
git push

# 4. Vercel will auto-deploy (or run `vercel --prod`)
```

The graph updates automatically! 🎉

## 🎨 Customization

### Change Your Zone 5 Range

Edit `scripts/parse-apple-health.py`:

```python
# For different age (example: age 25)
MAX_HEART_RATE = 195  # 220 - 25
ZONE_5_MIN = 176      # 90% of max
ZONE_5_MAX = 195      # 100% of max
```

### Change Daily Goal

Edit `scripts/parse-apple-health.py`:

```python
# In the save_to_json method
'dailyGoal': 20,  # Changed from 15 to 20 minutes
```

### Light Theme

Add `?theme=light` to your badge URL:

```markdown
![Zone 5](https://your-project.vercel.app/api/zone5-contributions?theme=light)
```

## 📊 Understanding Your Graph

### Color Levels

- **Dark gray** (🔲) - 0 minutes
- **Light green** (🟩) - 1-7 minutes
- **Medium green** (🟩🟩) - 8-14 minutes
- **Bright green** (🟩🟩🟩) - 15-22 minutes **(goal met!)**
- **Brightest green** (🟩🟩🟩🟩) - 23+ minutes **(excellent!)**

### Statistics Shown

- **🔥 Streak** - Current consecutive days with 15+ minutes
- **⚡ Total minutes** - All-time Zone 5 minutes
- **🎯 Days goal met** - Days with 15+ minutes

## 🏋️ Training Tips

### What is Zone 5?

Zone 5 is your maximum aerobic intensity zone:
- **Intensity:** 90-100% of max heart rate
- **Feel:** Very hard, can only sustain for short bursts
- **Duration:** 15-30 minutes per session recommended
- **Frequency:** 1-3 times per week

### Benefits

- ✅ Improves VO2 max
- ✅ Increases lactate threshold
- ✅ Enhances neuromuscular power
- ✅ Maximizes cardiac output

### Example Workouts

1. **High-Intensity Intervals**
   - 5 min warmup
   - 4x (4 min Zone 5 / 3 min recovery)
   - 5 min cooldown

2. **Threshold Runs**
   - 10 min warmup
   - 20 min sustained Zone 5
   - 10 min cooldown

3. **HIIT Sessions**
   - 5 min warmup
   - 10x (1 min Zone 5 / 1 min recovery)
   - 5 min cooldown

## 🔧 Troubleshooting

### "No heart rate data found"

- Make sure you wore your Apple Watch during workouts
- Check that Health app has heart rate permissions for your Watch
- Verify heart rate data exists in Health app

### "Parser runs but shows 0 minutes"

- Your heart rate may not have reached Zone 5 (171-190 bpm)
- Try more intense workouts
- Check if your max heart rate calculation is correct for your age

### "Graph not updating on GitHub"

- Check that `zone5-data.json` was updated
- Verify Vercel deployment succeeded
- Clear your browser cache (Ctrl+Shift+R)
- Wait 5 minutes for cache to expire

### "API returns error 500"

- Check that `zone5-data.json` exists in your repo
- Verify the JSON file is valid (use jsonlint.com)
- Check Vercel logs for specific errors

## 📁 File Structure

```
anhsrepo/
├── api/
│   └── zone5-contributions.js    # Vercel serverless function
├── scripts/
│   └── parse-apple-health.py     # Apple Health parser
├── zone5-data.json                # Your Zone 5 data
├── vercel.json                    # Vercel configuration
├── package.json                   # Node.js dependencies
└── ZONE5_SETUP.md                 # This guide
```

## 🤝 Contributing

Found a bug or have a feature idea? Open an issue or submit a PR!

## 📝 License

MIT License - feel free to use and modify!

---

**Stay on fire! 🔥 Hit those Zone 5 minutes every day!**
