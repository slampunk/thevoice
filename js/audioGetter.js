export default class AudioGetter {
    constructor() {
        this.stream = null;
        this.emitter = window.emitter;
        this.attachEvents();
    }

    attachEvents() {
        this.emitter.on('play.started', this.handlePlayStarted, false);
    }

    handlePlayStarted = async() => {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('about to send audio stream', this.stream);
        this.emitter.emit('audio.stream', this.stream);
    }
}