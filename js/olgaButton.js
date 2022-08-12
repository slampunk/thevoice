export default class OlgaButton {
    constructor() {
        this.button = document.getElementById('playButton');
        this.emitter = window.emitter;

        this.attachEvents();
    }

    attachEvents() {
        this.button.addEventListener('click', this.handleButtonClick, false);
    }

    handleButtonClick = e => {
        e.currentTarget.setAttribute('disabled', 'disabled');
        this.emitter.emit('play.started');
    }
}
