export default class AudioAnalyser {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.emitter = window.emitter;
        this.notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        this.smoothingThreshold = 10;
        this.smoothingCountThreshold = 5;
        this.smoothingCount = 0;
        this.attachEvents();
        this.stream = null;
        this.doAnalyse = false;
        this.previousNote = '';
        this.lastDetectTimestamp = 0;
        this.detectionWindow = 125;
    }

    initAnalyser() {
        this.audioSource = null;
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.minDecibels = -100;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;
    }

    attachEvents() {
        this.emitter.on('audio.stream', this.attachAudioStream);
        this.emitter.on('audio.stream.attached', this.analyseStream);
        this.emitter.on('song.ended', this.stopAnalysing);
    }

    stopAnalysing = () => {
        console.log('got song stop event');
        this.doAnalyse = false;
    }

    noteFromPitch(frequency) {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    attachAudioStream = stream => {
        this.stream = stream;
        this.initAnalyser();
        this.audioSource = this.audioContext.createMediaStreamSource(this.stream);
        const lowpassFilter = this.audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 1000;
        const highpassFilter = this.audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 100;
        this.audioSource.connect(lowpassFilter).connect(highpassFilter).connect(this.analyser)
        // this.audioSource.connect(this.analyser);
        this.emitter.emit('audio.stream.attached');
    }

    analyseStream = () => {
        this.initAnalyser();
        this.audioSource = this.audioContext.createMediaStreamSource(this.stream);
        this.audioSource.connect(this.analyser);
        this.doAnalyse = true;
        this.detectPitch();
    }

    detectPitch = (timestamp = 0) => {
        if (!this.doAnalyse) {
            return;
        }

        requestAnimationFrame(this.detectPitch);
        if (timestamp && timestamp - this.lastDetectTimestamp < this.detectionWindow) {
            return;
        }

        this.lastDetectTimestamp = timestamp;
        const bufferLength = this.analyser.fftSize;
        let buffer = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(buffer);
        const autoCorrelateValue = this.autoCorrelate(buffer, this.audioContext.sampleRate);
        const detectedNote = this.notes[this.noteFromPitch(autoCorrelateValue) % 12];

        if (autoCorrelateValue === -1) {
            return;
        }

        if (detectedNote === this.previousNote && this.smoothingCount < this.smoothingCountThreshold) {
            this.smoothingCount++;
        }
        else {
            this.previousNote = detectedNote;
            this.smoothingCount = 0;
        }

        this.emitter.emit('detected.note', detectedNote, timestamp);
    }

    autoCorrelate(buffer, sampleRate) {
        // Perform a quick root-mean-square to see if we have enough signal
        let SIZE = buffer.length;
        let sumOfSquares = 0;
        for (let i = 0; i < SIZE; i++) {
            let val = buffer[i];
            sumOfSquares += val * val;
        }
        let rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
        if (rootMeanSquare < 0.01) {
            return -1;
        }

        // Find a range in the buffer where the values are below a given threshold.
        let r1 = 0;
        let r2 = SIZE - 1;
        let threshold = 0.2;

        // Walk up for r1
        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buffer[i]) < threshold) {
                r1 = i;
                break;
            }
        }

        // Walk down for r2
        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buffer[SIZE - i]) < threshold) {
                r2 = SIZE - i;
                break;
            }
        }

        // Trim the buffer to these ranges and update SIZE.
        buffer = buffer.slice(r1, r2);
        SIZE = buffer.length

        // Create a new array of the sums of offsets to do the autocorrelation
        let c = new Array(SIZE).fill(0);
        // For each potential offset, calculate the sum of each buffer value times its offset value
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - i; j++) {
                c[i] = c[i] + buffer[j] * buffer[j + i]
            }
        }

        // Find the last index where that value is greater than the next one (the dip)
        let d = 0;
        while (c[d] > c[d + 1]) {
            d++;
        }

        // Iterate from that index through the end and find the maximum sum
        let maxValue = -1;
        let maxIndex = -1;
        for (let i = d; i < SIZE; i++) {
            if (c[i] > maxValue) {
                maxValue = c[i];
                maxIndex = i;
            }
        }

        let T0 = maxIndex;

        // Not as sure about this part, don't @ me
        // From the original author:
        // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
        // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
        // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
        let x1 = c[T0 - 1];
        let x2 = c[T0];
        let x3 = c[T0 + 1]

        let a = (x1 + x3 - 2 * x2) / 2;
        let b = (x3 - x1) / 2
        if (a) {
            T0 = T0 - b / (2 * a);
        }

        return sampleRate / T0;
    }
}