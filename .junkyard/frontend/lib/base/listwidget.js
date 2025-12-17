import { Widget, Signal } from './widget.js';

class ListItemWidget extends Widget { /*//DOC
    This widget represents an individual list item for ListWidget (see below)
    Must be subclassed for actual implementation.

    Ctor parameters:
    
    - index: index of this ListItemWidget with its ListWidget
    - datum: a datum.
    */
    constructor() {
        super();
    }
    
    setData(index, datum) {
        this.index = index;
        this.datum = structuredClone(datum)
        this.createState();
        this.createElement();
        return this
    }

    createSignals() {
        this.signals.clicked = new Signal(`Emitted when this list item is clicked.  Carries uuid.`);
    }
    activate_slot() { /*//DOC
        Highlights this list item
        */
        this.element.classList.add("table-warning"); // highlight
    }
    deactivate_slot() { /*//DOC
        Deh-highlights this list item
        */
        this.element.classList.remove("table-warning"); // dehighlight
    }
    createState() { 
    }
    deleteState() {
    }
    createElement() {
        // console.log(">", this.data);
        this.element = document.createElement("tr");
        this.element.innerHTML = this.getItemHTML()
        this.element.onclick = (event) => {
            this.signals.clicked.emit(this.datum.uuid);
        }
        /* // if you'd want to highlight when mouse hovers over the element
        this.element.onmouseover = (event) => {
            this.element.classList.add("table-primary");
        }
        this.element.onmouseout = (event) => {
            this.element.classList.remove("table-primary");
        }
        */
    }
    close() {
    }
    getElement() { // parent uses this to attach it to the html tree
        return this.element;
    }
    getDatum() {
        return this.datum;
    }
    getItemHTML() { /*//DOC
        You need to subclass this to get an actual working implementation
        */
        throw("ListItemWidget: getItemHTML must be subclassed to adapt to your datamodel")
        /* for example:
        return `
        <th scope="row">${this.datum.index}</th>
        <td>${this.datum.name}</td>
        <td>${this.datum.surname}</td>
        <td>${this.datum.email}</td>
        `
        */
    }
} // ListItemWidget


class ListWidget extends Widget { /*//DOC
    Creates a list of datums.  Each datum is a different row in a table.  A current datum can be chosen by clicking it.

    Uses a child widget class (listItemClass) that hardcodes the expected data column schema.

    TODO: this widget should be updated to use the dynamic data scheme (no hardcoding of data schemas).
    */
    listItemClass = ListItemWidget; // define the list item class here as a class variable

    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
        this.generateList([]);
    }
    createSignals() {
        this.signals.current_datum = new Signal(`Carries the active/chosen datum.  If nothing chosen, the carries null.`);
    }
    datums_slot(datums) { /*//DOC
        Set all the datums in the list.

        The argument is a list of json objects
        */
        this.log(-2, "datums_slot", datums)
        // clear all previous data & set new one
        this.datums = structuredClone(datums);
        this.generateList(datums);
        if (this.current_datum != null) { // there was an activated/chosen element in the list..
            let uuid = this.current_datum.uuid; // let's save it's uuid
            this.current_datum = null; // set none selected
            this.log(-1, "datums_slot: using previously acticated uuid", uuid)
            this.activate_slot(uuid); // look uuid in new/updated datums & reset it to activated/chosen element
        }
    }
    activate_slot(uuid) { /*//DOC
        Activates a datum in the list, based on it's uuid

        uuid == null deactivates/unchooses all datums in the list
        */
        this.log(-1, "activate_slot: uuid=", uuid)
        if ( (this.current_datum != null) && (this.current_datum.uuid == uuid) ) {
            this.log(-1, "already chosen")
            return;
        }
        this.current_datum = null;
        this.list_items.forEach(list_item => { // set current datum to matching uuid
            list_item.deactivate_slot();
            let datum = list_item.getDatum();
            if (datum.uuid == undefined) {
                this.err("activate_slot: datum with no uuid!")
                return
            }
            if (uuid == datum.uuid) {
                this.log(-1, "activate_slot: activating uuid", uuid)
                this.current_datum = datum;
                list_item.activate_slot();
                this.signals.current_datum.emit(datum);
            }
        })
        if (this.current_datum == null) { // found no matching element
            this.log(-1, "activate_slot: deactivating")
            this.signals.current_datum.emit(null); // tell any connected widgets that nothings been chosen
        }
    }
    // state & html element
    createState() {
        this.current_datum = null
        this.list_items = new Array()
    }
    deleteState() {
        this.list_items.forEach(item => item.close());
        delete this.list_items;
    }
    createElement() {
        console.log(">", this)
        this.findElement(this.id);
        this.checkElement("TABLE");
        this.element.innerHTML=`
        <thead>
        </thead>
        <tbody>
        </tbody>
        `
        this.thead = this.element.getElementsByTagName("thead").item(0)
        this.body = this.element.getElementsByTagName("tbody").item(0)
        // we could generate this programmatically:
        this.thead.innerHTML=this.getHeaderHTML()
    }
    generateList(datums) {
        // close & remove earlier ListItemWidget(s):
        this.list_items.forEach(item => {
            this.body.removeChild(item.getElement());
            item.close();
        });
        delete this.list_items;
        this.list_items = new Array()
        var cc=0;
        datums.forEach(datum => {
            var item = new this.listItemClass().setData(cc, datum);
            item.signals.clicked.connect(
                this.activate_slot.bind(this)
            );
            this.list_items.push(item);
            this.body.appendChild(item.getElement());
            cc = cc+1;
        }
        )
    }

    getHeaderHTML() { /*//DOC
        You need to subclass this to get an actual working implementation
        */
        throw("ListWidget: getHeaderHTML must be subclassed to adapt to your datamodel")
        // for example:
        /*
        return `
        <tr>
        <th scope="col">#</th>
        <th scope="col">First</th>
        <th scope="col">Last</th>
        <th scope="col">Email</th>
        </tr>
        `
        */
    }

} // ListWidget


class ExampleListItemWidget extends ListItemWidget { /*//DOC
    An actual example subclass / implementation of a list item
    */
    getItemHTML() {
        return `
        <th scope="row">${this.index}</th>
        <td>${this.datum.name}</td>
        <td>${this.datum.surname}</td>
        <td>${this.datum.email}</td>
        `
    }
}

class ExampleListWidget extends ListWidget { /*//DOC
    An actual example subclass / implementation of a list item
    */
    listItemClass = ExampleListItemWidget;

    getHeaderHTML() {
        return `
        <tr>
        <th scope="col">#</th>
        <th scope="col">First</th>
        <th scope="col">Last</th>
        <th scope="col">Email</th>
        </tr>
        `
    }

}

export { ListWidget, ListItemWidget, ExampleListWidget }
