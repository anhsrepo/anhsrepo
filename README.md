# Zone 5 Heart Rate Training Tracker

![Zone 5 Training Contributions](https://anhsrepo-zone5-tracker.vercel.app/api/zone5-contributions)

## About

Track your Zone 5 heart rate training with a beautiful GitHub-style contribution graph! This system automatically processes your Apple Watch workout data and visualizes your daily Zone 5 achievements (171-190 bpm for age 30).

**Daily Goal:** 15+ minutes in Zone 5 🎯

## Features

- 🏃‍♂️ **Real-time Heart Rate Monitoring**: Track Zone 5 training sessions (171-190 bpm for age 30)
- 📊 **GitHub-style Contribution Graph**: Visual representation of daily Zone 5 achievements
- 🍎 **Apple Health Integration**: Direct integration with HealthKit for seamless data import
- 📱 **iOS Safari Optimization**: Native support for iPhone/iPad with haptic feedback
- 📈 **Performance Analytics**: Track VO2 max improvement and cardiovascular gains
- 🎵 **Spotify Top Artists**: Visualize your music listening patterns with GitHub-style aesthetics

## 🚀 Quick Setup

**See [ZONE5_SETUP.md](./ZONE5_SETUP.md) for complete setup guide!**

### 3-Step Quick Start

1. **Export Apple Health Data**
   ```bash
   # On iPhone: Health app → Profile → Export All Health Data
   # AirDrop to Mac and unzip
   ```

2. **Process Your Workouts**
   ```bash
   python3 scripts/parse-apple-health.py ~/Downloads/apple_health_export/export.xml
   ```

3. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

Your contribution graph will be live at: `https://your-app.vercel.app/api/zone5-contributions` 🎉


## 📁 Project Structure

### Zone 5 Tracker (Main Project)
- `api/zone5-contributions.js` - Vercel serverless function (generates SVG graph)
- `scripts/parse-apple-health.py` - Apple Health XML parser
- `zone5-data.json` - Your daily Zone 5 achievements
- `zone5-tracker.html` - Web-based live tracker interface
- `apple-health-connector.js` - HealthKit integration for iOS
- `ZONE5_SETUP.md` - **📖 Complete setup guide**

### Other Projects
- `percolator/` - Solana perpetual exchange protocol (Rust)
- `hyperliquid-python-sdk/` - Python SDK for Hyperliquid trading
- `tinker-cookbook/` - LLM fine-tuning examples

## Weekly Stats

### 💻 GitHub Activity
- **Commits**: 0
- **Pull Requests**: 0
- **Issues Closed**: 0
- **Code Reviews**: 0

### 🏃‍♂️ Health & Fitness
- **Steps**: 52,000
- **Active Hours**: 21h
- **Workout Sessions**: 5

*Last updated by AI Assistant: 2025-10-23 17:17 UTC*

