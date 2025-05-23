# 🏃‍♂️ Zone 5 Heart Rate Tracker

**Real-time Apple Health integration with GitHub-style contribution visualization**

![Zone 5 Tracker](https://img.shields.io/badge/Zone%205-171--190%20BPM-red)
![Age](https://img.shields.io/badge/Age-30-blue)
![Max HR](https://img.shields.io/badge/Max%20HR-190%20BPM-orange)

## 🎯 What is Zone 5?

Zone 5 represents **90-100% of your maximum heart rate** - the highest intensity training zone focused on:
- **VO2 Max development** - Maximum oxygen uptake capacity
- **Neuromuscular power** - Explosive strength and speed
- **Lactate tolerance** - Ability to perform at high intensities
- **Cardiac output maximization** - Peak heart pumping efficiency

### Your Personal Zone 5 (Age 30)
- **Maximum Heart Rate**: 190 bpm (220 - 30)
- **Zone 5 Range**: 171-190 bpm
- **Target Duration**: 15-30 minutes per workout
- **Weekly Goal**: 45-90 minutes total

## 🚀 Quick Start

### Option 1: Direct Web Access
Open [`zone5-tracker.html`](https://anhsrepo.github.io/anhsrepo/zone5-tracker.html) in your browser

### Option 2: Apple Health Integration
1. Export your Apple Health data:
   - Open **Health app** on iPhone
   - Tap your **profile** → **Export All Health Data**
   - Share the exported XML file
2. Upload to the tracker for real-time analysis

### Option 3: Live Demo
Click **"Generate Demo Data"** to see a year of realistic Zone 5 training data

## 📊 Features

### GitHub-Style Contribution Graph
- **Darker squares** = More time in Zone 5
- **Color intensity** based on daily Zone 5 minutes:
  - Level 0: 0 minutes (gray)
  - Level 1: 1-4 minutes (light green)
  - Level 2: 5-14 minutes (medium green)
  - Level 3: 15-29 minutes (dark green)
  - Level 4: 30+ minutes (brightest green)

### Real-Time Monitoring
- Live heart rate tracking
- Instant Zone 5 detection
- Achievement celebrations
- Session summaries

### Data Analytics
- Daily/weekly/monthly Zone 5 totals
- Peak heart rate tracking
- Training intensity patterns
- Progress visualization

## 📱 Apple Health Integration

### Automatic Sync (iOS Safari)
```javascript
// Initialize real-time monitoring
await zone5Monitor.initialize();
await zone5Monitor.startMonitoring();

// Check today's status
const status = zone5Monitor.getTodayStatus();
console.log(`Today: ${status.zone5Minutes} minutes in Zone 5`);
```

### Manual Data Import
1. Export Apple Health data as XML
2. Upload to tracker
3. Automatic parsing and visualization
4. Historical data analysis

## 🎮 Interactive Controls

### Start Live Monitoring
```javascript
// Begin real-time heart rate tracking
zone5Monitor.startMonitoring();
```

### Check Current Status
```javascript
// Get today's Zone 5 achievement
const today = zone5Monitor.getTodayStatus();
if (today.achieved) {
    console.log(`🎉 Zone 5 achieved! ${today.zone5Minutes} minutes`);
}
```

### Export Training Data
```javascript
// Export for sharing or backup
const data = zone5Monitor.exportHealthData();
```

## 🔬 Training Science

### Zone 5 Benefits
| Benefit | Description | Time to See Results |
|---------|-------------|-------------------|
| **VO2 Max** | Increased oxygen utilization | 4-6 weeks |
| **Power Output** | Higher peak performance | 2-4 weeks |
| **Lactate Threshold** | Better high-intensity endurance | 3-5 weeks |
| **Cardiac Efficiency** | Improved heart pumping | 6-8 weeks |

### Optimal Training Protocol
- **Frequency**: 2-3 sessions per week
- **Duration**: 15-30 minutes per session
- **Rest**: 48-72 hours between sessions
- **Progression**: Increase by 2-3 minutes weekly

### Sample Zone 5 Workouts
1. **Interval Training**: 5 x 3min @ Zone 5, 3min recovery
2. **Tempo Blocks**: 3 x 8min @ Zone 5, 5min recovery
3. **Peak Power**: 8 x 30sec @ Zone 5, 90sec recovery

## 📈 Progress Tracking

### Daily Goals
- [ ] Reach Zone 5 at least once
- [ ] Maintain 15+ minutes in Zone 5
- [ ] Record peak heart rate
- [ ] Complete training session

### Weekly Targets
- [ ] 3+ Zone 5 training days
- [ ] 45+ total Zone 5 minutes
- [ ] Progressive overload
- [ ] Recovery monitoring

### Monthly Objectives
- [ ] Improve VO2 Max indicators
- [ ] Increase Zone 5 capacity
- [ ] Optimize training consistency
- [ ] Track performance gains

## 🛠 Technical Implementation

### Heart Rate Zones Calculation
```javascript
const age = 30;
const maxHR = 220 - age; // 190 bpm
const zone5Min = Math.round(maxHR * 0.90); // 171 bpm
const zone5Max = maxHR; // 190 bpm
```

### Real-Time Detection
```javascript
function isZone5(heartRate) {
    return heartRate >= 171 && heartRate <= 190;
}
```

### Contribution Graph Algorithm
```javascript
function getIntensityLevel(minutes) {
    if (minutes === 0) return 0;
    if (minutes < 5) return 1;
    if (minutes < 15) return 2;
    if (minutes < 30) return 3;
    return 4;
}
```

## 🔐 Privacy & Security

- **Local Storage**: All data stored locally in browser
- **No Cloud Sync**: Your health data stays on your device
- **Optional Sharing**: Export data only when you choose
- **Apple Health**: Uses standard HealthKit APIs (iOS only)

## 🤝 Contributing

### Feature Requests
- Additional heart rate zones
- Training plan integration
- Wearable device sync
- Social challenges

### Bug Reports
- File issues on GitHub
- Include browser/device info
- Describe expected vs actual behavior

## 📚 Resources

### Heart Rate Training
- [Zone-Based Training Guide](https://www.trainingpeaks.com/blog/heart-rate-training-zones/)
- [VO2 Max Improvement](https://www.runnersworld.com/training/a20812270/all-about-vo2-max/)
- [High-Intensity Training](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6089334/)

### Apple Health Integration
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Heart Rate Data Types](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/1615440-heartrate)

---

**🎯 Today's Challenge**: Can you hit Zone 5 and make your contribution graph glow green?

**⚡ Quick Access**: [`Open Zone 5 Tracker`](https://anhsrepo.github.io/anhsrepo/zone5-tracker.html)

*Last updated: 2025-05-23 | Version: 1.0.0*