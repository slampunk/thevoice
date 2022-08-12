export default class AudioPlayer {
    constructor() {
        this.emitter = window.emitter;
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.buffer = null;
        this.init();
        this.source = null;
        this.attachEvents();
    }

    attachEvents() {
        this.emitter.on('audio.stream.attached', this.play);
    }

    init() {
        fetch('/res/snippet.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.buffer = audioBuffer;
            });
    }

    play = () => {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0;
        this.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 5);
        setTimeout(() => {
            this.gainNode.gain.value = 0.1;
        }, 15000)
        console.log(this.audioContext.currentTime);
        source.start();
    }
}