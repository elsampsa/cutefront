import { Widget, Signal } from '../lib/base/widget.js';

class ProfileWidget extends Widget { /*//DOC
    Shows a 2D profile of a sample of Very Expensive Material
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.clicked = new Signal(); /*//DOC Sent when this profile heatmap has been clicked.  Carries sample uuid. */
    }

    sample_slot(data) { /*//DOC
        data has (at least) the following members:
        uuid: uuid
        data: a 2D heatmap of dimensions x=500, y=100
        */
        this.log(-1, "got uuid", data.uuid);
        this.state.uuid = data.uuid;
        this.updateHeatmap(data.data);
    }

    createState() {
        this.state = {
            uuid: null,
            heatmap: null
        };
    }

    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            console.error("Could not find element with id:", this.id);
            return;
        }
        this.element.classList.add('row', 'm-3', 'shadow', 'mx-auto');
        this.element.style.width = '800px';
        this.element.style.height = '200px';
        this.element.style.cursor = 'pointer';
        this.element.onclick = () => {
            if (this.state.uuid !== null) {
                this.signals.clicked.emit(this.state.uuid);
            }
        };
    }

    updateHeatmap(data) {
        //if (this.state.uuid !== null) {
            this.state.heatmap = data;
            if (data !== null) {
                Plotly.newPlot(this.id, [{
                    z: data,
                    type: 'heatmap',
                    colorscale: 'Greys'
                }], {
                    margin: { t: 0, r: 0, l: 0, b: 0 }
                });
            } else {
                // Create an empty plot
                Plotly.newPlot(this.id, [], {
                    margin: { t: 0, r: 0, l: 0, b: 0 }
                });
            }
        //}
    }
    
}

export { ProfileWidget };
