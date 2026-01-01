#!/usr/bin/env python3
"""
Apple Health Zone 5 Parser
Extracts heart rate data from Apple Health export and calculates Zone 5 minutes

Usage:
    python scripts/parse-apple-health.py /path/to/apple_health_export/export.xml

Zone 5 Definition (Age 30):
    - Max Heart Rate: 190 bpm (220 - 30)
    - Zone 5 Range: 171-190 bpm (90-100% of max HR)
    - Daily Goal: 15+ minutes
"""

import xml.etree.ElementTree as ET
import json
from datetime import datetime, timedelta
from collections import defaultdict
import sys
from pathlib import Path

# Zone 5 Configuration (Age 30)
MAX_HEART_RATE = 190
ZONE_5_MIN = 171  # 90% of max
ZONE_5_MAX = 190  # 100% of max

class AppleHealthParser:
    def __init__(self, xml_path):
        self.xml_path = xml_path
        self.heart_rate_data = []
        self.workout_data = []

    def parse_xml(self):
        """Parse Apple Health export.xml file"""
        print(f"📖 Parsing {self.xml_path}...")

        try:
            tree = ET.parse(self.xml_path)
            root = tree.getroot()

            # Extract heart rate records
            for record in root.findall('.//Record[@type="HKQuantityTypeIdentifierHeartRate"]'):
                try:
                    date_str = record.get('startDate')
                    value = float(record.get('value'))

                    # Parse date
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))

                    self.heart_rate_data.append({
                        'date': date,
                        'bpm': value,
                        'source': record.get('sourceName', 'Unknown')
                    })
                except (ValueError, TypeError) as e:
                    continue

            # Extract workout records for context
            for workout in root.findall('.//Workout'):
                try:
                    start_date_str = workout.get('startDate')
                    end_date_str = workout.get('endDate')
                    workout_type = workout.get('workoutActivityType')

                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))

                    self.workout_data.append({
                        'start': start_date,
                        'end': end_date,
                        'type': workout_type,
                        'duration': (end_date - start_date).total_seconds() / 60  # minutes
                    })
                except (ValueError, TypeError) as e:
                    continue

            print(f"✅ Found {len(self.heart_rate_data):,} heart rate records")
            print(f"✅ Found {len(self.workout_data):,} workout records")

        except FileNotFoundError:
            print(f"❌ Error: File not found: {self.xml_path}")
            sys.exit(1)
        except ET.ParseError as e:
            print(f"❌ Error parsing XML: {e}")
            sys.exit(1)

    def calculate_zone5_minutes(self):
        """Calculate daily Zone 5 minutes from heart rate data"""
        print(f"\n🔥 Calculating Zone 5 minutes (171-190 bpm)...")

        # Group heart rate readings by day
        daily_readings = defaultdict(list)

        for record in self.heart_rate_data:
            date_key = record['date'].date().isoformat()
            daily_readings[date_key].append(record)

        # Calculate Zone 5 minutes for each day
        zone5_achievements = {}

        for date_str, readings in sorted(daily_readings.items()):
            zone5_readings = [r for r in readings if ZONE_5_MIN <= r['bpm'] <= ZONE_5_MAX]

            if zone5_readings:
                # Estimate minutes in Zone 5
                # Heart rate is typically recorded every 1-5 minutes
                # We'll estimate based on number of Zone 5 readings

                # Get time span of Zone 5 readings
                zone5_times = sorted([r['date'] for r in zone5_readings])

                if len(zone5_times) >= 2:
                    # Calculate total time span with Zone 5 readings
                    total_seconds = (zone5_times[-1] - zone5_times[0]).total_seconds()
                    minutes = max(1, int(total_seconds / 60))
                else:
                    # Single reading - assume 1 minute
                    minutes = 1

                zone5_achievements[date_str] = minutes

                # Show days with significant Zone 5 time
                if minutes >= 5:
                    status = "🎯" if minutes >= 15 else "⚡"
                    print(f"  {status} {date_str}: {minutes} minutes ({len(zone5_readings)} readings)")

        return zone5_achievements

    def get_statistics(self, achievements):
        """Calculate statistics"""
        if not achievements:
            return {
                'totalDays': 0,
                'totalMinutes': 0,
                'daysWithGoal': 0,
                'averageMinutes': 0
            }

        total_minutes = sum(achievements.values())
        days_with_goal = sum(1 for m in achievements.values() if m >= 15)

        return {
            'totalDays': len(achievements),
            'totalMinutes': total_minutes,
            'daysWithGoal': days_with_goal,
            'averageMinutes': round(total_minutes / len(achievements), 1)
        }

    def save_to_json(self, achievements, output_path='zone5-data.json'):
        """Save Zone 5 data to JSON file"""
        data = {
            'lastUpdate': datetime.utcnow().isoformat() + 'Z',
            'zone5Range': f'{ZONE_5_MIN}-{ZONE_5_MAX} bpm',
            'maxHeartRate': MAX_HEART_RATE,
            'userAge': 30,
            'dailyGoal': 15,
            'statistics': self.get_statistics(achievements),
            'achievements': achievements
        }

        output_file = Path(output_path)
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"\n💾 Saved to {output_file}")
        print(f"\n📊 Statistics:")
        print(f"  Total days with Zone 5: {data['statistics']['totalDays']}")
        print(f"  Total Zone 5 minutes: {data['statistics']['totalMinutes']}")
        print(f"  Days meeting goal (15+ min): {data['statistics']['daysWithGoal']}")
        print(f"  Average minutes per day: {data['statistics']['averageMinutes']}")

        return data

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python scripts/parse-apple-health.py /path/to/export.xml")
        print("\nTo get export.xml:")
        print("1. Open Health app on iPhone")
        print("2. Tap your profile picture")
        print("3. Scroll down and tap 'Export All Health Data'")
        print("4. AirDrop the export.zip to your Mac")
        print("5. Unzip and find export.xml")
        sys.exit(1)

    xml_path = sys.argv[1]

    print("🏃‍♂️ Apple Health Zone 5 Parser")
    print("=" * 50)

    # Parse and process
    parser = AppleHealthParser(xml_path)
    parser.parse_xml()
    achievements = parser.calculate_zone5_minutes()

    # Save results
    parser.save_to_json(achievements)

    print("\n✅ Done! Your Zone 5 data is ready.")
    print("   Next: Deploy to Vercel to see your contribution graph!")

if __name__ == '__main__':
    main()
