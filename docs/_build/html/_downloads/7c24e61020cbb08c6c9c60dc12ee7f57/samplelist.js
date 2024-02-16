import { Widget, Signal } from '../lib/base/widget.js';

class SampleItemWidget extends Widget { /*//DOC
    A list element of SampleListWidget.
    Shows the datetime string of the sample and it's status (polished or not)
    */
    constructor(sample) {
        super(null);
        this.sample = structuredClone(sample); // creates it's own copy of the data
        // this.polished = false; // this state variable is not needed: it's all in the HTML
        this.createElement();
    }

    createSignals() {
        this.signals.clicked = new Signal(); /*//DOC Carries sample uuid.  
        Emitted when the item is clicked.
        Connected to the parent list widget.
        */
    }

    polished_slot() { /*//DOC
        Set's this item's status to polished.
        */
        // this.polished = true; // this state variable is not needed: it's all in the HTML
        this.prow.classList.remove('text-warning');
        this.prow.classList.add('text-success');
        this.prow.innerText = 'polished';
    }

    createElement() {
        this.element = document.createElement('tr');
        this.element.classList.add("table");
        this.element.innerHTML = `
            <td>${this.sample.datetime}</td>
            <td class="text-warning">unpolished</td>
        `;
        this.element.onclick = () => {
            this.signals.clicked.emit(this.sample.uuid);
            this.log(-1, "SampleItemWidget: clicked uuid", this.sample.uuid);
        };
        this.prow = this.element.getElementsByTagName("td").item(1);
    }

    getHTML() {
        return this.element;
    }

    highlight() {
        this.element.classList.add("table-warning"); // highlight
    }

    lowlight() {
        this.element.classList.remove("table-warning"); // dehighlight
    }
    
}

class SampleListWidget extends Widget { /*//DOC
    A list of samples with their datetime strings and statuses 
    (polished or not).
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.new_sample = new Signal(); /*//DOC 
        Carries a sample object {uuid:string, datetime:string, data:2D profile}.  
        Emitted when a new sample is added to this list (i.e. a "relay" signal).
        */
        this.signals.chosen_sample = new Signal(); /*//DOC 
        Carries a sample object {uuid:string, datetime:string, data:2D profile}.
        Emitted when a sample is clicked highlighted in the list
        */
    }

    new_sample_slot(sample) { /*//DOC
        input is an object with
        uuid: uuid string
        datetime: datetime string
        data: a 2D profile
        */
        this.signals.new_sample.emit(sample);
        this.createSampleItem(sample);
    }

    choose_sample_slot(uuid) { /*//DOC
        input is a uuid string
        set's the sample chosen in the list
        */
        if (this.samples.hasOwnProperty(uuid)) {
            this.removeHighlights()
            this.current_uuid = uuid;
            // Highlight the corresponding SampleItemWidget
            this.samples[uuid].highlight();
        } else {
            console.error("Sample with UUID", uuid, "does not exist.");
        }
    }

    sample_clicked_slot(uuid) { /*//DOC
        input is a uuid string
        called by the child list items when they are clicked
        */
        if (this.samples.hasOwnProperty(uuid)) {
            this.removeHighlights()
            this.samples[uuid].highlight();
            this.signals.chosen_sample.emit(this.samples[uuid].sample);
        } else {
            console.error("Sample with UUID", uuid, "does not exist.");
        }
    }

    polished_slot(uuid) { /*//DOC
        input is a uuid string
        sets a sample status to "polished"
        */
        if (this.samples.hasOwnProperty(uuid)) {
            this.samples[uuid].polished_slot();
        } else {
            console.error("Sample with UUID", uuid, "does not exist.");
        }
    }

    clear_slot() { /*//DOC
        clears all samples from the list
        */
        this.clearSamples()
        this.signals.new_sample.emit({uuid: null, datetime: null, data: null});
        this.signals.chosen_sample.emit({uuid: null, datetime: null, data: null});
    }

    createState() {
        this.samples = {};
        this.current_uuid = null;
    }

    createSampleItem(sample) {
        const sampleItemWidget = new SampleItemWidget(sample);
        sampleItemWidget.setLogLevel(this.loglevel);
        sampleItemWidget.signals.clicked.connect(() => {
            this.sample_clicked_slot(sample.uuid);
        });
        this.samples[sample.uuid] = sampleItemWidget;
        this.tbody.appendChild(sampleItemWidget.getHTML());
        //sampleItemWidget.signals.clicked.connect(
        //    this.sample_clicked_slot.bind(this.sample_clicked_slot));
    }

    removeSampleItem(uuid) {
        if (this.samples.hasOwnProperty(uuid)) {
            this.tbody.removeChild(this.samples[uuid].getHTML());
            this.samples[uuid].signals.clicked.disconnect( // disconnect the signal
                this.sample_clicked_slot.bind(this))
            delete this.samples[uuid];
        } else {
            console.error("Sample with UUID", uuid, "does not exist.");
        }
    }

    clearSamples() {
        this.tbody.innerHTML=``;
        this.samples = {};
        this.current_uuid = null;
        for (const uuid in this.samples) {
            this.samples[uuid].signals.clicked.disconnect( // disconnect the signal
                this.sample_clicked_slot.bind(this))
        }
    }

    removeHighlights() {
        for (const uuid in this.samples) {
            if (this.samples.hasOwnProperty(uuid)) {
                this.samples[uuid].lowlight();
            }
        }
    }

    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            console.error("Could not find element with id:", this.id);
            return;
        }
        this.element.innerHTML=`
        <thead>
        <tr>
            <th>Datetime</th>
            <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <!-- SampleItemWidgets will be dynamically added here -->
        </tbody>
        `
        this.tbody=this.element.getElementsByTagName("tbody").item(0)
    }

}

export { SampleItemWidget, SampleListWidget };
