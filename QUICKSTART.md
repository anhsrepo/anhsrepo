# Zone 5 Tracker - Quick Start 🚀

Your Zone 5 heart rate tracker is ready! Here's what to do next.

## ✅ What's Been Built

You now have a complete system with:

1. **📊 GitHub-Style Contribution Graph** - Beautiful SVG graph showing your daily Zone 5 training
2. **🔧 Apple Health Parser** - Python script to extract heart rate data from Apple Health exports
3. **⚡ Vercel API** - Serverless function to generate the graph on-demand
4. **📱 Sample Data** - Pre-loaded with 45 days of demo data

## 🎯 Next Steps (3 Minutes)

### Step 1: Deploy to Vercel (1 min)

```bash
cd /Users/an/anhsrepo

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy!
vercel --prod
```

Vercel will give you a URL like: `https://anhsrepo.vercel.app`

### Step 2: Add to GitHub Profile (30 seconds)

Your graph is now live at:
```
https://your-vercel-app.vercel.app/api/zone5-contributions
```

Add this to your GitHub profile README:

```markdown
## 🏃‍♂️ Zone 5 Training

![Zone 5 Contributions](https://your-vercel-app.vercel.app/api/zone5-contributions)

**Daily Goal:** 15+ minutes at 171-190 bpm (Zone 5)
```

### Step 3: Add Your Real Data (1 min)

When you're ready to add your actual Apple Watch data:

```bash
# 1. Export from iPhone Health app
#    Health app → Profile → Export All Health Data → AirDrop to Mac

# 2. Run the parser
python3 scripts/parse-apple-health.py ~/Downloads/apple_health_export/export.xml

# 3. Commit and push
git add zone5-data.json
git commit -m "Update Zone 5 data - $(date +%Y-%m-%d)"
git push

# Vercel auto-deploys! ✨
```

## 📖 Full Documentation

- **[ZONE5_SETUP.md](./ZONE5_SETUP.md)** - Complete setup guide with customization options
- **[README.md](./README.md)** - Project overview

## 🎨 What You'll See

Your contribution graph will show:

- **🟩 Green squares** for each day of Zone 5 training
- **Darker green** = more minutes (0, 1-7, 8-14, 15-22, 23+ min)
- **🔥 Current streak** - consecutive days meeting 15+ min goal
- **⚡ Total minutes** - all-time Zone 5 minutes
- **🎯 Goal met days** - days with 15+ minutes

## 🏋️ Zone 5 Training Tips

**What is Zone 5?**
- 171-190 bpm for age 30 (90-100% max HR)
- Very hard intensity, short bursts
- 15-30 min per session recommended

**Benefits:**
- ✅ Improves VO2 max
- ✅ Increases lactate threshold
- ✅ Enhances cardiovascular performance

**Example Workout:**
```
5 min warmup
4 x (4 min Zone 5 / 3 min recovery)
5 min cooldown
= 16 minutes Zone 5 🎯
```

## 🐛 Troubleshooting

**Graph not showing?**
- Check Vercel deployment succeeded: `vercel ls`
- Verify zone5-data.json exists
- Wait 5 min for cache to clear

**No Zone 5 minutes found?**
- Make sure you wore Apple Watch during workouts
- Try more intense workouts (HIIT, sprints, hard runs)
- Verify heart rate reached 171+ bpm

## 🎉 You're Done!

Stay on fire! Hit that 15+ minute goal every day! 🔥

---

**Built with Claude Code** | [GitHub Repo](https://github.com/anhsrepo/anhsrepo)
