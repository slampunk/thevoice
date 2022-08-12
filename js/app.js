import EventEmitter from './eventEmitter.js';
import Button from './button.js'
import AudioGetter from './audioGetter.js'
import AudioAnalyser from './audioAnalyser.js';
import AudioPlayer from './audioPlayer.js';
import ScoreKeeper from './scorekeeper.js';

function displayDetectedNote(note) {
    document.getElementById('lyrics').innerHTML = note;
}

function setLyrics() {
    document.getElementById('lyrics').classList.add('start');
    document.getElementById('countdown').classList.add('start');
}

class App {
    constructor() {
        window.emitter = new EventEmitter();
        this.button = new Button();
        this.audioGetter = new AudioGetter();
        this.AudioAnalyser = new AudioAnalyser();
        this.audioPlayer = new AudioPlayer();
        this.scoreKeeper = new ScoreKeeper();
        // window.emitter.on('detected.note', displayDetectedNote);
        window.emitter.on('audio.stream.attached', setLyrics);
    }
}

const app = new App();