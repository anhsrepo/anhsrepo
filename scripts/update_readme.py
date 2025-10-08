#!/usr/bin/env python3
"""
AI-powered README updater with Apple Health integration
"""

import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import requests
import re
import os

class HealthDataProcessor:
    def __init__(self):
        self.health_data = {}
        
    def parse_apple_health_export(self, xml_file_path):
        """Parse Apple Health export XML"""
        try:
            tree = ET.parse(xml_file_path)
            root = tree.getroot()
            
            # Get recent data (last 7 days)
            recent_date = datetime.now() - timedelta(days=7)
            
            steps = 0
            active_energy = 0
            workouts = 0
            
            for record in root.findall('.//Record'):
                if record.get('type') == 'HKQuantityTypeIdentifierStepCount':
                    date_str = record.get('startDate')[:10]
                    record_date = datetime.strptime(date_str, '%Y-%m-%d')
                    if record_date >= recent_date:
                        steps += float(record.get('value', 0))
                        
                elif record.get('type') == 'HKQuantityTypeIdentifierActiveEnergyBurned':
                    date_str = record.get('startDate')[:10]
                    record_date = datetime.strptime(date_str, '%Y-%m-%d')
                    if record_date >= recent_date:
                        active_energy += float(record.get('value', 0))
            
            for workout in root.findall('.//Workout'):
                date_str = workout.get('startDate')[:10]
                workout_date = datetime.strptime(date_str, '%Y-%m-%d')
                if workout_date >= recent_date:
                    workouts += 1
            
            self.health_data = {
                'steps': int(steps),
                'active_energy': int(active_energy),
                'workouts': workouts
            }
            
        except Exception as e:
            print(f"Error parsing health data: {e}")
            # Fallback to simulated data
            self.health_data = {
                'steps': 52000,  # Weekly average
                'active_energy': 2100,
                'workouts': 5
            }

class GitHubStatsCollector:
    def __init__(self, username, token):
        self.username = username
        self.token = token
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
    
    def get_weekly_stats(self):
        """Collect GitHub activity stats for the past week"""
        try:
            # Get user events
            response = requests.get(
                f'https://api.github.com/users/{self.username}/events',
                headers=self.headers,
                params={'per_page': 100}
            )
            
            if response.status_code != 200:
                raise Exception(f"GitHub API error: {response.status_code}")

            events = response.json()
            
            # Count different event types from the last week
            week_ago = datetime.now() - timedelta(days=7)
            
            commits = 0
            prs = 0
            issues = 0
            reviews = 0
            
            for event in events:
                event_date = datetime.fromisoformat(event['created_at'].replace('Z', '+00:00'))
                if event_date >= week_ago:
                    if event['type'] == 'PushEvent':
                        commits += len(event.get('payload', {}).get('commits', []))
                    elif event['type'] == 'PullRequestEvent':
                        prs += 1
                    elif event['type'] == 'IssuesEvent':
                        issues += 1
                    elif event['type'] == 'PullRequestReviewEvent':
                        reviews += 1
            
            return {
                'commits': commits,
                'prs': prs,
                'issues': issues,
                'reviews': reviews
            }
            
        except Exception as e:
            print(f"Error fetching GitHub stats: {e}")
            return {'commits': 0, 'prs': 0, 'issues': 0, 'reviews': 0}

class ReadmeUpdater:
    def __init__(self, readme_path='README.md'):
        self.readme_path = readme_path
        
    def update_stats(self, github_stats, health_data):
        """Update README with new stats"""
        try:
            with open(self.readme_path, 'r') as f:
                content = f.read()
            
            # Update GitHub stats
            content = re.sub(r'\*\*Commits\*\*: \d+', f"**Commits**: {github_stats['commits']}", content)
            content = re.sub(r'\*\*Pull Requests\*\*: \d+', f"**Pull Requests**: {github_stats['prs']}", content)
            content = re.sub(r'\*\*Issues Closed\*\*: \d+', f"**Issues Closed**: {github_stats['issues']}", content)
            content = re.sub(r'\*\*Code Reviews\*\*: \d+', f"**Code Reviews**: {github_stats['reviews']}", content)
            
            # Update health stats
            content = re.sub(r'\*\*Steps\*\*: .*', f"**Steps**: {health_data['steps']:,}", content)
            content = re.sub(r'\*\*Active Hours\*\*: .*', f"**Active Hours**: {health_data['active_energy']//100}h", content)
            content = re.sub(r'\*\*Workout Sessions\*\*: .*', f"**Workout Sessions**: {health_data['workouts']}", content)
            
            # Update timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M UTC')
            content = re.sub(r'\{\{ date \}\}', timestamp, content)
            
            with open(self.readme_path, 'w') as f:
                f.write(content)
                
            print(f"README updated successfully at {timestamp}")
            
        except Exception as e:
            print(f"Error updating README: {e}")

def main():
    """Main execution function"""
    # Configuration
    GITHUB_USERNAME = os.getenv('GITHUB_ACTOR', 'anhsrepo')
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')
    HEALTH_DATA_PATH = os.getenv('HEALTH_DATA_PATH', 'apple_health_export.xml')
    
    # Initialize processors
    health_processor = HealthDataProcessor()
    github_collector = GitHubStatsCollector(GITHUB_USERNAME, GITHUB_TOKEN)
    readme_updater = ReadmeUpdater()
    
    # Process health data
    if os.path.exists(HEALTH_DATA_PATH):
        health_processor.parse_apple_health_export(HEALTH_DATA_PATH)
    else:
        # Use simulated data if no health export available
        health_processor.health_data = {
            'steps': 52000,
            'active_energy': 2100,
            'workouts': 5
        }
    
    # Collect GitHub stats
    github_stats = github_collector.get_weekly_stats()
    
    # Update README
    readme_updater.update_stats(github_stats, health_processor.health_data)
    
    print("Update completed!")
    print(f"GitHub Stats: {github_stats}")
    print(f"Health Data: {health_processor.health_data}")

if __name__ == "__main__":
    main()
