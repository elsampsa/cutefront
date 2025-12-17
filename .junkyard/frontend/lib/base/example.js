// this is a template file you can use as a basis to create your own widget
//
// choose import scheme:
import { Widget, Signal } from '../lib/base/widget.js'; // app specific
// import { Widget, Signal } from './widget.js'; // base widget

class MyWidget extends Widget { /*//DOC
    Explain here what your widget does
    */
    constructor(id) {
        super(id); // calls createSignals automagically
        this.createElement();
        this.createState();
    }
    createSignals() { // called automagically by super() in the ctor
        this.signals.some_signal = new Signal(`Explain what this signal carries & when it is emitted`);
    }
    some_slot(par) { /*//DOC
        Explain what kind of data this slot expects
        and when the slot is used
        */
        // permute state, send signals, do something with the elements
        // call methods that does all those things..
    }
    another_slot(obj) { /*//DOC
        Explain what kind of data this slot expects
        and when the slot is used
        */
        // for slots that receive objects or arrays,
        // before permuting them, create a mutable copy
        // obj=obj.slice() // for arrays with simple objects
        // obj=structuredClone(obj) // for complete objects
    }
    createState() {
        if (this.element == null) {
            return
        }
        // this.some_variable = true
    }
    createElement() {
        // hook into html elements and/or create new ones, etc.
        // for example:
        // this.element = document.getElementById(this.id)
        // this.element = document.createElement("tr")
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
    }
    deleteState() { // optional
        // remove any mem reserving state variables if necessary
    }
    deleteElement() { // optional
        // remove any html element(s) if necessary
    }
    // internal methods
    someMethod() {
    }

} // MyWidget

export { MyWidget }
