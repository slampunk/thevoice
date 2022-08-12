export default class Button {
    constructor() {
        this.button = document.getElementById('playButton');
        this.emitter = window.emitter;

        this.attachEvents();
    }

    attachEvents() {
        this.button.addEventListener('click', this.handleButtonClick, false);
    }

    handleButtonClick = e => {
        e.currentTarget.classList.toggle('playing');
        this.emitter.emit('play.' + (e.currentTarget.classList.contains('playing') ? 'started' : 'ended'));
    }
}
