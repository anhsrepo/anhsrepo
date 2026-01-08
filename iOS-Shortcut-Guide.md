# iOS Shortcut - Zone 5 Auto Sync

Automatic Zone 5 data sync from Apple Health to your GitHub profile.

## Super Simple Setup (2 minutes)

### Step 1: Create the Shortcut

Open **Shortcuts app** and create a new shortcut:

---

**Action 1: Find Health Samples**
```
Type: Heart Rate
Start Date: is in the last 7 days
Sort by: Start Date
```

**Action 2: Repeat with Each** (Health Samples)
```
Get Details of Health Sample:
  - Start Date → Format as: yyyy-MM-dd (save as "date")
  - Value (save as "bpm")

Add to Variable: readings
  {"date": "[date]", "bpm": [bpm]}
```

**Action 3: Text**
```
{"heartRates": [[readings]]}
```

**Action 4: Get Contents of URL**
```
URL: https://anhsrepo-zone5-tracker.vercel.app/api/health-sync
Method: POST
Headers:
  Content-Type: application/json
Request Body: [Text from Action 3]
```

**Action 5: Show Notification**
```
Zone 5 data synced!
```

---

## Automation (Set and Forget)

### After Every Workout (Recommended)
1. **Shortcuts** → **Automation** → **+**
2. **Personal Automation** → **Workout**
3. Select **"Any"** and **"Is Ended"**
4. Choose your Zone 5 Sync shortcut
5. Turn **OFF** "Ask Before Running"

Now every time you end a workout, your Zone 5 data syncs automatically!

### Alternative: Daily Sync
1. **Shortcuts** → **Automation** → **+**
2. **Time of Day** → 10:00 PM
3. Choose your Zone 5 Sync shortcut
4. Turn **OFF** "Ask Before Running"

---

## Apple Watch

Add the shortcut to your Watch face:
1. Edit Watch face
2. Add **Shortcuts** complication
3. Select your Zone 5 Sync shortcut
4. Tap to sync anytime!

---

## How It Works

```
Apple Watch → iPhone Health → Shortcut → Vercel API → Graph Updates
```

1. Apple Watch records heart rate during workouts
2. Data syncs to iPhone Health app
3. Shortcut reads heart rate samples
4. Sends to Vercel API endpoint
5. API calculates Zone 5 minutes (171-190 bpm)
6. Your GitHub profile graph updates!

---

## Troubleshooting

**No heart rate data found**
- Settings → Health → Data Access & Devices → Shortcuts → Enable
- Make sure Apple Watch is paired and syncing

**Request failed**
- Check internet connection
- Try again in a few seconds

**Graph not updating**
- Allow 5 minutes for Vercel to redeploy
- Check https://anhsrepo-zone5-tracker.vercel.app/api/zone5-contributions

---

**100% Apple Native** - Uses only iOS Shortcuts and HealthKit
**Zero Config** - No tokens or API keys needed
**Automatic** - Set up once, never think about it again
