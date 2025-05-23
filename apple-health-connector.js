/**
 * Apple Health Zone 5 Heart Rate Monitor
 * Real-time connector for monitoring cardiovascular performance
 * Age: 30 | Max HR: 190 bpm | Zone 5: 171-190 bpm
 */

class AppleHealthZone5Monitor {
    constructor() {
        this.maxHeartRate = 190; // 220 - 30 (age)
        this.zone5Min = 171;     // 90% of max HR
        this.zone5Max = 190;     // 100% of max HR
        this.currentSession = null;
        this.todayData = [];
        this.zone5Achievements = this.loadStoredData();
    }

    /**
     * Initialize the monitor with Apple Health permissions
     */
    async initialize() {
        try {
            // For iOS Safari with HealthKit integration
            if (this.isIOSSafari()) {
                await this.requestHealthKitPermissions();
            }
            
            console.log('✅ Apple Health Zone 5 Monitor initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Apple Health connection:', error);
            return false;
        }
    }

    /**
     * Check if running on iOS Safari (HealthKit available)
     */
    isIOSSafari() {
        const ua = navigator.userAgent;
        return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua);
    }

    /**
     * Request HealthKit permissions for heart rate data
     */
    async requestHealthKitPermissions() {
        if (typeof window.webkit !== 'undefined' && 
            window.webkit.messageHandlers && 
            window.webkit.messageHandlers.healthKit) {
            
            // Request heart rate read permission
            const permission = await new Promise((resolve) => {
                window.webkit.messageHandlers.healthKit.postMessage({
                    action: 'requestPermission',
                    dataTypes: ['heartRate']
                });
                
                // Listen for response
                window.addEventListener('healthKitResponse', (event) => {
                    resolve(event.detail.authorized);
                }, { once: true });
            });
            
            return permission;
        }
        
        throw new Error('HealthKit not available');
    }

    /**
     * Start real-time heart rate monitoring
     */
    async startMonitoring() {
        if (this.currentSession) {
            console.log('⚠️ Monitoring already active');
            return;
        }

        this.currentSession = {
            startTime: new Date(),
            zone5Minutes: 0,
            maxHeartRate: 0,
            readings: []
        };

        console.log('🏃‍♂️ Zone 5 monitoring started');
        
        // Start periodic heart rate checks
        this.monitoringInterval = setInterval(() => {
            this.checkCurrentHeartRate();
        }, 15000); // Check every 15 seconds

        return this.currentSession;
    }

    /**
     * Stop monitoring and save session data
     */
    stopMonitoring() {
        if (!this.currentSession) {
            console.log('⚠️ No active monitoring session');
            return null;
        }

        clearInterval(this.monitoringInterval);
        
        const session = this.currentSession;
        session.endTime = new Date();
        session.duration = session.endTime - session.startTime;

        // Save to today's data
        this.saveTodaySession(session);
        
        console.log(`🏁 Session completed: ${session.zone5Minutes} minutes in Zone 5`);
        
        this.currentSession = null;
        return session;
    }

    /**
     * Get current heart rate from Apple Health
     */
    async checkCurrentHeartRate() {
        try {
            const heartRate = await this.getCurrentHeartRate();
            
            if (heartRate && this.currentSession) {
                this.currentSession.readings.push({
                    time: new Date(),
                    heartRate: heartRate,
                    isZone5: this.isZone5(heartRate)
                });

                // Update max heart rate
                if (heartRate > this.currentSession.maxHeartRate) {
                    this.currentSession.maxHeartRate = heartRate;
                }

                // Count Zone 5 time (15 seconds = 0.25 minutes)
                if (this.isZone5(heartRate)) {
                    this.currentSession.zone5Minutes += 0.25;
                    console.log(`🔥 Zone 5! HR: ${heartRate} bpm | Total: ${this.currentSession.zone5Minutes.toFixed(1)}min`);
                    
                    // Trigger celebration effect
                    this.triggerZone5Achievement(heartRate);
                }

                // Update UI
                this.updateRealtimeDisplay(heartRate);
            }
        } catch (error) {
            console.error('❌ Error reading heart rate:', error);
        }
    }

    /**
     * Get current heart rate from HealthKit
     */
    async getCurrentHeartRate() {
        if (this.isIOSSafari() && window.webkit && window.webkit.messageHandlers.healthKit) {
            return new Promise((resolve) => {
                window.webkit.messageHandlers.healthKit.postMessage({
                    action: 'getCurrentHeartRate'
                });
                
                window.addEventListener('heartRateUpdate', (event) => {
                    resolve(event.detail.heartRate);
                }, { once: true });
            });
        }
        
        // Fallback: simulate realistic heart rate for demo
        return this.simulateRealtimeHeartRate();
    }

    /**
     * Simulate realistic heart rate data for demo purposes
     */
    simulateRealtimeHeartRate() {
        const baseHR = 70 + Math.random() * 40; // 70-110 resting range
        const activity = Math.random();
        
        if (activity > 0.9) {
            // 10% chance of Zone 5 (high intensity)
            return Math.floor(Math.random() * 20) + this.zone5Min;
        } else if (activity > 0.7) {
            // 20% chance of Zone 3-4 (moderate-high intensity)
            return Math.floor(Math.random() * 30) + 140;
        } else {
            // 70% chance of lower zones
            return Math.floor(baseHR + Math.random() * 30);
        }
    }

    /**
     * Check if heart rate is in Zone 5
     */
    isZone5(heartRate) {
        return heartRate >= this.zone5Min && heartRate <= this.zone5Max;
    }

    /**
     * Trigger Zone 5 achievement celebration
     */
    triggerZone5Achievement(heartRate) {
        // Visual celebration
        if (typeof document !== 'undefined') {
            this.showZone5Celebration(heartRate);
        }

        // Haptic feedback on iOS
        if (this.isIOSSafari() && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    /**
     * Show Zone 5 achievement celebration
     */
    showZone5Celebration(heartRate) {
        const celebration = document.createElement('div');
        celebration.innerHTML = `🔥 ZONE 5! ${heartRate} BPM 🔥`;
        celebration.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 18px;
            z-index: 10000;
            animation: celebration 3s ease-out forwards;
            box-shadow: 0 5px 15px rgba(255,107,107,0.3);
        `;

        // Add animation keyframes
        if (!document.querySelector('#zone5-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'zone5-animation-styles';
            style.textContent = `
                @keyframes celebration {
                    0% { transform: translateY(-100px) scale(0.5); opacity: 0; }
                    20% { transform: translateY(0) scale(1.1); opacity: 1; }
                    80% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-20px) scale(0.9); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 3000);
    }

    /**
     * Update real-time display
     */
    updateRealtimeDisplay(heartRate) {
        const elements = {
            currentHR: document.getElementById('currentHeartRate'),
            zone5Status: document.getElementById('zone5Status'),
            todayZone5: document.getElementById('zone5Minutes')
        };

        if (elements.currentHR) {
            elements.currentHR.textContent = heartRate;
            elements.currentHR.className = this.isZone5(heartRate) ? 'zone5-active' : '';
        }

        if (elements.todayZone5 && this.currentSession) {
            elements.todayZone5.textContent = this.currentSession.zone5Minutes.toFixed(1);
        }

        if (elements.zone5Status) {
            if (this.isZone5(heartRate)) {
                elements.zone5Status.textContent = 'IN ZONE 5! 🔥';
                elements.zone5Status.className = 'zone5-active';
            } else {
                elements.zone5Status.textContent = 'Monitoring...';
                elements.zone5Status.className = '';
            }
        }
    }

    /**
     * Save today's session data
     */
    saveTodaySession(session) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.zone5Achievements[today]) {
            this.zone5Achievements[today] = 0;
        }
        
        this.zone5Achievements[today] += session.zone5Minutes;
        
        // Save to localStorage
        localStorage.setItem('zone5Achievements', JSON.stringify(this.zone5Achievements));
        
        // Update contribution graph
        this.updateContributionGraph();
    }

    /**
     * Load stored Zone 5 achievement data
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem('zone5Achievements');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading stored data:', error);
            return {};
        }
    }

    /**
     * Update GitHub-style contribution graph
     */
    updateContributionGraph() {
        if (typeof updateContributionGraph === 'function') {
            updateContributionGraph();
        }
    }

    /**
     * Get today's Zone 5 achievement status
     */
    getTodayStatus() {
        const today = new Date().toISOString().split('T')[0];
        const todayMinutes = this.zone5Achievements[today] || 0;
        
        return {
            date: today,
            zone5Minutes: todayMinutes,
            achieved: todayMinutes > 0,
            goal: 15, // 15 minutes is a good Zone 5 target
            goalAchieved: todayMinutes >= 15
        };
    }

    /**
     * Export health data for Apple Health integration
     */
    exportHealthData() {
        const sessions = this.todayData;
        const healthKitData = sessions.map(session => ({
            startDate: session.startTime.toISOString(),
            endDate: session.endTime.toISOString(),
            heartRateReadings: session.readings,
            zone5Minutes: session.zone5Minutes,
            maxHeartRate: session.maxHeartRate
        }));

        return {
            metadata: {
                age: 30,
                maxHeartRate: this.maxHeartRate,
                zone5Range: `${this.zone5Min}-${this.zone5Max}`,
                exportDate: new Date().toISOString()
            },
            sessions: healthKitData,
            achievements: this.zone5Achievements
        };
    }
}

// Global instance
const zone5Monitor = new AppleHealthZone5Monitor();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        await zone5Monitor.initialize();
        console.log('🚀 Zone 5 Monitor ready!');
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppleHealthZone5Monitor;
} else if (typeof window !== 'undefined') {
    window.AppleHealthZone5Monitor = AppleHealthZone5Monitor;
    window.zone5Monitor = zone5Monitor;
}