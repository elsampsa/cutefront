import { Widget, Signal } from './widget.js'; // paths for base widget inheritance

class CardWidget extends Widget { /*//DOC
    Shows data.  The data column scheme adapt to a desired datamodel.

    Each column/piece of data belonging to a record is displayed in a separate row, i.e. like this:
    
    Name            John
    Surname         Doe
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() {
    }
    datamodel_slot(datamodel) { /*//DOC
        Initialize / adapt this widget to a certain data column scheme.

        Argument datamodel is a json object where the key is a unique name identifying
        a column (say "name", "surname", etc.) and the value is a FormField instance.

        Example:
        import { FreeStringFormField, IntegerFormField } from './formfield.js';

        datamodel = {
            name: new FreeStringFormField("Name", "Person's name"),
            age: new IntegerFormField("Age", "Person's age")
        }

        widget.datamodel_slot(datamodel);
        */
        this.log(-1, "datamodel_slot", datamodel)
        this.datamodel=datamodel;
    }
    current_datum_slot(datum) { /*//DOC
        Sets the current data in the widget
        */
        this.log(-1, "current_datum_slot", datum)
        this.current_datum=datum;
        if (this.datamodel == null) {
            this.err("datamodel_slot must be called first")
            return;
        }
        if (this.current_datum == null) {
            this.log(-1, "current_datum_slot: got null datum");
            this.element.innerHTML = ``;
            return;
        }
        this.element.innerHTML=`
        <div class="card">
            <h5 class="card-header">Details</h5>
            <div class="card-body">
                <div class="container">
                </div>
            </div>
        </div>
        `
        var body_element = this.element.getElementsByClassName("card-body")[0]
        var line = ``
        for (const [key, value] of Object.entries(datum)) { /* datum key, value
            fields not described by the datamodel (uuid for example)
            are silently omitted
            you can also subclass this whole method & "hardcode" the field labels
            and used fields
            */
            if (this.datamodel.hasOwnProperty(key)) {
                let datamodel = this.datamodel[key]
                const label = datamodel["label"]
                this.log(-2, `using ${label}: ${value}`);
                line = line.concat(`
                <div class="row justify-content-start">
                    <div class="col-4 card-text">
                        ${label}
                    </div>
                    <div class="col-4 card-text">
                        ${value}
                    </div>
                </div>
                `)
            }
        body_element.innerHTML=line
        }
    }
    createState() {
        this.datamodel = null; // see datamodel_slot function for precise definition
        this.current_datum = null;
    }
    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            this.err("could not find element with id", this.id)
        }
    }

} // CardWidget

export { CardWidget }
