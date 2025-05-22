# Real-time Apple Health Sync Setup

## iOS Shortcut for Automatic Health Data Sync

### Step 1: Create GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Save the token securely

### Step 2: iOS Shortcut Configuration

Create a new iOS Shortcut with these actions:

```
1. Get Health Sample (Steps)
   - Sample Type: Steps
   - Get: Most Recent Samples
   - Limit: 1
   - Unit: Count

2. Get Health Sample (Active Energy)
   - Sample Type: Active Energy Burned
   - Get: Most Recent Samples
   - Limit: 1
   - Unit: Calories

3. Get Health Sample (Workouts)
   - Sample Type: Workouts
   - Get: Today's Samples
   - Limit: 100

4. Get Numbers from Input (Steps)
   - Input: Health Sample from step 1
   - Get: Numbers from Health Sample

5. Get Numbers from Input (Energy)
   - Input: Health Sample from step 2
   - Get: Numbers from Health Sample

6. Count Items (Workouts)
   - Input: Health Sample from step 3

7. Get Contents of URL (GitHub API Call)
   - URL: https://api.github.com/repos/anhngit/anhngit/dispatches
   - Method: POST
   - Headers:
     - Authorization: token YOUR_GITHUB_TOKEN
     - Accept: application/vnd.github.v3+json
   - Request Body (JSON):
     {
       "event_type": "health-update",
       "client_payload": {
         "steps": [Steps from step 4],
         "active_energy": [Energy from step 5],
         "workouts": [Workout count from step 6]
       }
     }
```

### Step 3: Automation Setup

1. Open Shortcuts app → Automation
2. Create Personal Automation
3. Trigger: Time of Day (every hour) OR App (Health app)
4. Action: Run the shortcut created above
5. Turn off "Ask Before Running"

### Step 4: Test the Integration

Run the shortcut manually first to verify it works, then check your GitHub profile README for updates.

## Alternative: Manual Trigger

If you prefer manual control, you can:
1. Add the shortcut to home screen
2. Run it after workouts
3. Use Siri voice command: "Hey Siri, sync health data"

## Troubleshooting

- Ensure Health app permissions are granted
- Verify GitHub token has correct permissions
- Check GitHub Actions tab for workflow runs
- Health data might take a few minutes to sync

## Privacy Note

This setup only shares your daily totals (steps, calories, workout count) - no detailed health information or personal data is transmitted.
