// Step counter using device accelerometer
class StepCounter {
    constructor() {
        this.steps = 0;
        this.isTracking = false;
        this.lastStepTime = 0;
        this.threshold = 1.3; // Acceleration threshold for detecting a step
        this.stepMinInterval = 300; // Minimum ms between steps
        this.listener = null;
        this.previousAcceleration = 0;
    }

    async start(onStepCallback) {
        if (this.isTracking) return true;

        try {
            // Check if DeviceMotionEvent is available
            if (typeof DeviceMotionEvent === 'undefined') {
                throw new Error('Device motion not supported');
            }

            // Request permission on iOS 13+
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Motion permission denied');
                }
            }

            this.isTracking = true;
            this.listener = (event) => this.handleMotion(event, onStepCallback);
            window.addEventListener('devicemotion', this.listener);

            return true;
        } catch (error) {
            console.error('Step counter error:', error);
            return false;
        }
    }

    handleMotion(event, callback) {
        if (!event.accelerationIncludingGravity) return;

        const { x, y, z } = event.accelerationIncludingGravity;

        // Calculate total acceleration magnitude
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        // Detect step by measuring acceleration changes
        const now = Date.now();
        const delta = Math.abs(acceleration - this.previousAcceleration);

        // Step detected: significant acceleration change + minimum time elapsed
        if (delta > this.threshold &&
            now - this.lastStepTime > this.stepMinInterval) {
            this.steps++;
            this.lastStepTime = now;

            if (callback) {
                callback(this.steps);
            }
        }

        this.previousAcceleration = acceleration;
    }

    stop() {
        if (this.listener) {
            window.removeEventListener('devicemotion', this.listener);
            this.listener = null;
        }
        this.isTracking = false;
    }

    reset() {
        this.steps = 0;
        this.lastStepTime = 0;
    }

    getSteps() {
        return this.steps;
    }

    setSteps(count) {
        this.steps = count;
    }
}

export const stepCounter = new StepCounter();
