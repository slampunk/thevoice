import EventEmitter from './eventEmitter.js';
import AudioGetter from './audioGetter.js';
import OlgaButton from './olgaButton.js'
import AudioAnalyser from './audioAnalyser.js';

function displayDetectedNote(note) {
    document.getElementById('lyrics').innerHTML = note;
}

class App {
    constructor() {
        window.emitter = new EventEmitter();
        this.button = new OlgaButton();
        this.audioGetter = new AudioGetter();
        this.audioAnalyser = new AudioAnalyser('contestant');
        window.emitter.on('detected.note.contestant', displayDetectedNote);
    }
}

const app = new App();