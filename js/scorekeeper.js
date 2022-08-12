export default class ScoreKeeper {
    constructor() {
        this.emitter = window.emitter;
        this.notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        this.attachEvents();
    }

    attachEvents() {
        this.emitter.on('detected.note', this.handleNote);
    }

    handleNote = (note, timestamp) => {
        if (timestamp < 16000) {
            return;
        }

        console.log(note, timestamp);
    }
}