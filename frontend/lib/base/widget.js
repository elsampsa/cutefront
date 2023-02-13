
// first, some generic helper functions
function assertKeys(keys, obj) {
    // check obj for keys
    keys.forEach(key => {
        if (!obj.hasOwnProperty(key)) {
            console.trace()
            throw(`missing key ${key}`)
        }
    })
}

function getPageParameters() {
    // get urlencoded parameters as a dictionary
    var url = new URL(document.documentURI);
    var obj = new Object()
    for (const [key, value] of url.searchParams) {
        // console.log(key,":", value)
        obj[key] = value
    }
    return obj
}

function equalSets(setA, setB) {
    // check if two sets are equal
    for (const elem of setB) {
      if (!setA.has(elem)) {
        return False
      }
    }
    return True
}

function uuidv4() {
    // as per https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


/*Base class for Widgets
*/
class Widget {
    constructor() {
        this.loglevel = 0; // 0 = normal.  smaller: useless, bigger: usefull
        this.signals = new Object(); // i.e. json
        this.createSignals();
    }
    createElement() { // set the html element corresponding to this component
        this.err("you must subclass createElement");
    }
    createState() {
        this.err("you must subclass createState");
    }
    deleteState() { // remove any mem reserving state variables if necessary
    }
    deleteElement() { // remove any html element(s) if necessary
    }
    createSignals() {
        this.err("you must subclass createSignals");
    }
    close() {
        for (const [name, signal] of Object.entries(this.signals)) {
            signal.close();
        }
        delete this.signals;
        this.deleteState();
        this.deleteElement();
    }
    log(...args) {
        // console.log("loglevel", this.loglevel, "args", args)
        if (args[0] < this.loglevel) {
            return;
        }
        args.splice(0, 1);
        args.unshift(this.constructor.name + ":");
        console.log(...args);
    }
    err(...args) {
        args.unshift(this.constructor.name + ":");
        console.error(...args);
    }
    setLogLevel(num) {
        this.loglevel = num;
    }
}

class Signal {
    constructor() {
        this.callbacks=new Array();
    }
    connect(method) { // register method that's called when emit is called
        this.callbacks.push(method);
    }
    disconnect(method) { //  deregister a method
        let i = this.callbacks.find(func => func == method);
        if (i>0) {
            this.callbacks.pop(i);
        }
        else {
            console.log("Signal: could not find method from callback list");
        }
    }
    emit(par) { // call all registered functions when signal is emitted
        // this.callbacks.forEach(func => func(obj));
        this.callbacks.forEach(cb => {
           cb(par);
        });
    }
    close() {
        delete this.callbacks;
    }
}

class DummyWidget extends Widget {
    // everything that comes to the slot
    // is just dumped to the console
    constructor() {
        super();
        this.createElement();
        this.createState();
    }

    // IN: slots
    slot(par) {
        this.log(0, "got ", par)
    }

    createSignals() {};
    createElement() {};
    createState() {};
}

class DumpWidget extends Widget {
    // data arriving to slot is
    // stringified & dumped into the DOM
    constructor(id) {
        super();
        this.id = id;
        this.createElement();
        this.createState();
    }

    // IN: slots
    slot(par) {
        this.log(0, "got ", par)
        this.element.innerHTML = JSON.stringify(par, null, '\t')
    }

    createSignals() {};
    createElement() {
        this.log(0, this.id)
        this.element = document.getElementById(this.id)
        this.log(0, this.element)
    };
    createState() {};
}

export { Widget, Signal, DummyWidget, DumpWidget, 
    assertKeys, getPageParameters, equalSets, uuidv4 };
