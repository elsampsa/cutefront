import { Widget, Signal } from './widget.js'; // path for base widget inheritance

class Floater extends Widget { /*//DOC
    A base class for floating card div element
    This demo base class creates a floating mini-card to the bottom-right of the page with some CuteFront propaganda.
    arg: image_path is a path to the CuteFront logo png file
    */
    constructor(image_path) {
        super(null);
        this.image_path = image_path;
        this.createElement();
        this.createState();
    }
    createSignals() { 
        this.signals.clicked = new Signal(`Emitted when the floater is clicked`);
    }
    createState() {
    }
    createElement() { // subclass this one according to your needs
        this.element=document.createElement("div")
        this.element.style="position: fixed; bottom: 10px; right: 10px; z-index: 1000;"
        this.element.className="card"
        this.element.innerHTML=`
        <a class="btn btn-outline-info btn-sm" href="https://elsampsa.github.io/cutefront/_build/html/index.html" target="_blank" rel="noopener noreferrer">
            Powered by <img src="${this.image_path}" height="30">
        </a>
        `
        document.body.appendChild(this.element);

        this.element.onclick = (event) => {
            this.signals.clicked.emit()
        }
    }

} // Floater

export { Floater }
