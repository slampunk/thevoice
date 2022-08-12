import EventEmitter from './eventEmitter.js';
import Button from './button.js'
import AudioGetter from './audioGetter.js'
import AudioAnalyser from './audioAnalyser.js';

function displayDetectedNote(note) {
    document.getElementById('lyrics').innerHTML = note;
}

class App {
    constructor() {
        window.emitter = new EventEmitter();
        this.button = new Button();
        this.audioGetter = new AudioGetter();
        this.AudioAnalyser = new AudioAnalyser();
        window.emitter.on('detected.note', displayDetectedNote);
    }
}

const app = new App();