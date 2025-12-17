/* This file has:

- Helper functions
- The base class implementation "Widget" for all CuteFront widgets
*/

// first, some generic helper functions

function isDOMElement(obj) {
    return obj instanceof Element || obj instanceof HTMLDocument;
}

function assertKeys(keys, obj) { // check an object for keys
    keys.forEach(key => {
        if (!obj.hasOwnProperty(key)) {
            console.trace()
            throw(`missing key ${key}`)
        }
    })
}

function boxify(element) { // modify an html element so that it has visible boxes all around it
    if (element == undefined) {
        element=document.getElementsByTagName("body").item(0)
    }
    element.classList.add("border")
    element.classList.add("border-primary")
    var children = element.children;
    for (var i = 0; i < children.length; i++) {
        boxify(children[i]);
    }
}


function getPageParameters() { // get the URLencoded parameters as a dictionary
    var url = new URL(document.documentURI);
    var obj = new Object()
    for (const [key, value] of url.searchParams) {
        // console.log(key,":", value)
        obj[key] = value
    }
    return obj
}

function equalSets(setA, setB) { // check if two sets are equal
    for (const elem of setB) {
      if (!setA.has(elem)) {
        return False
      }
    }
    return True
}

function uuidv4() { // generate uuid version 4
    // as per https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


function randomID() {
    // as per https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    return `A${uuidv4()}`
  }

function csv2obj(str) { // split a string like this: "orange=1,banana=2,apple=3" into an object {orange:1, banana:2, apple:3}
  var obj = new Object()
  if (str.length < 1) {
    return obj;
  }
  str.split(",").forEach(function(substring) {
    let parts = substring.split("=");
    obj[parts[0]] = parseInt(parts[1]);
  });
  return obj
}

function obj2csv(obj) { // inverse of csv2obj
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${value}`)
        .join(",");
}

function extractDocstring(functionString) {
    const docMatch = functionString.match(/\/\*\/\/DOC\s*([\s\S]*?)\*\//);
    if (!docMatch) return '';
    
    let docstring = docMatch[1];
    
    // Split into lines and completely normalize each line
    const lines = docstring
        .split(/\r?\n/)
        .map(line => line.trim())  // Remove ALL leading/trailing whitespace
        .filter((line, index, arr) => {
            // Remove empty lines at start and end, but keep internal empty lines
            if (line === '') {
                return index > 0 && index < arr.length - 1 && 
                       arr.slice(0, index).some(l => l !== '') &&
                       arr.slice(index + 1).some(l => l !== '');
            }
            return true;
        });
    
    return lines.join('\n');
}

function isPlainObject(obj) { // check if this is a plain "dictionary" object
    return obj && 
           typeof obj === 'object' && 
           !Array.isArray(obj) && 
           obj.constructor === Object;
}

function subWidgetRecurse(mainobj) { /*
    handle subwidgets using recursion
    say, gets input this.widgets["subSectionWidget1"], this.widgets["subSectionWidget2"] where both are Widget instances.
    runs through all key, value pairs
    detecs that ("subSectionWidget1", obj = Widget), etc.
    adds them to subdict
    
    suppose this.widgets["items"] = Object(), this.widgets["forms"] = Object()
    detects that ("items", obj = Object)
    adds "items" to subdict and recurses
    ->
    detects ("someWidget", obj = Widget), etc.
    */
    const tree = Object();
    for (const [key, obj] of Object.entries(mainobj)) {
        if (obj instanceof Widget) { // 1
            tree[key] = obj.getAPITree(); // get API tree recursively for this subwidget
        } else if (isPlainObject(obj)) { // 2
            tree[key] = subWidgetRecurse(obj);
        } else {
            this.log(-1, "subWidgetRecurse: invalid subwidget", key);
        }
    }
    return tree;
}

// Function to get all methods across the entire prototype chain
function getAllMethodsInPrototypeChain(obj) {
    const methods = new Set();
    
    let currentPrototype = Object.getPrototypeOf(obj);
    while (currentPrototype && currentPrototype !== Object.prototype) {
        // Get all property names from the current prototype
        const methodNames = Object.getOwnPropertyNames(currentPrototype)
            .filter(name => 
                name !== 'constructor' && 
                typeof obj[name] === 'function'
            );

        // Log the current prototype and its methods for debugging
        // console.log(`Methods in prototype ${currentPrototype.constructor.name}:`, methodNames);

        // Add methods to the set
        methodNames.forEach(name => methods.add(name));

        // Move up the prototype chain
        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    return Array.from(methods);
}


class Widget { /* The Base class implementation for CuteFront Widgets

    Subclass should always call this superclasses ctor.
    Parameter id is the id of the html element to which this widget attaches to.
    */
    constructor(id) {
        this.id = id
        this.loglevel = 0; // 0 = normal.  smaller: useless, bigger: usefull
        // API exposure:
        this.signals = new Object(); // i.e. json
        this.widgets = new Object(); // subwidgets of this widget the API user can access directly
        this.components = new Object(); // subwidgets/other objects of this widget that the API user should not access directly
        this.input_fields = new Object(); // FormField instances for widgets that use forms
        this.createSignals();
        // this._enhanceSlotMethods(); // add class info to the _slot methods // TODO: does this work or not?
    }
    createSignals() {
        this.err("you must subclass createSignals");
    }
    createElement() { // set the html element corresponding to this component
        this.err("you must subclass createElement");
        // the main html element dom object shall be in the member this.element
    }
    findElement(par) { /*//DOC
        checks if par is an HTMLElement, if not, then try to find an element
        with id = par from the DOM.  Of that fails, print an error.
        On success, return set this.element to the HTMLElement.
        */
        if (par instanceof HTMLElement) {
            // Parameter is already an HTML element
            this.element = par;
            return;
        }
        // Try to find element by ID
        this.element = document.getElementById(par);
        if (this.element == null) {
            this.err("could not find element with id", par);
        }
    }
    checkElement(tagname) { /*//DOC
        Checks if this.element has the correct tagname.
        If not, logs an error and changes the element's tag to the requested one.
        Argument tagname should be uppercase (e.g. "TABLE", "DIV", etc.)
        */
        if (this.element.tagName !== tagname) {
            this.err(`html element tagname must be ${tagname}, not ${this.element.tagName}, changing tag`)
            // Create new element with correct tag
            const new_element = document.createElement(tagname);
            // Copy attributes
            for (const attr of this.element.attributes) {
                new_element.setAttribute(attr.name, attr.value);
            }
            // Replace old element with new one
            if (this.element.parentNode) {
                this.element.parentNode.replaceChild(new_element, this.element);
            }
            this.element = new_element;
        }
    }
    autoElement() { /*//DOC
        Handles this.element according to this.id.  If this.id is:
        - an HTML element, set this.element = this.id
        - a string, search for an id in the DOM and attach this.element to it
        - null or undefined, create a new orphan div element and set this.element to it:
          this widget is then used by parent widgets, like this:
          ```
          parent.element.appendChild(child.element)
          ``` 
        */
        if (this.id instanceof HTMLElement) {
            this.element = this.id;
            return;
        }
        if (typeof this.id === 'string') {
            this.element = document.getElementById(this.id);
            if (!this.element) {
                this.err("could not find element with id", this.id);
                this.element = null;
            }
            else {
                return;
            }
        }
        if (this.id === undefined || this.id == null) {
            this.log(-1, "creating orphan element");
            // console.log("creating orphan element"); 
            this.element = document.createElement("div");
            return;
        }
        this.err("id must be HTMLElement instance, string or null or undefined", this.id);
    }
    getElement() { // returns the html element of this widget
        return this.element
    }
    createState() {
        this.err("you must subclass createState");
    }
    deleteState() { // remove any mem reserving state variables if necessary
    }
    deleteElement() { // remove any html element(s) if necessary
    }
    createSignals() { // This must be subclassed
        this.err("you must subclass createSignals");
    }
    setVisible(visible) { // set the widget's html element visible or not
        this.log(-1, "setVisible", visible)
        if (!(typeof visible === 'boolean')) {
            this.err("need boolean value")
        }
        if (this.element) {
            if (visible) {
                if (this.isVisible()) { // already visible
                    // this.log(-2, "already visible");
                    // return
                }
                else {
                    // recoved saved visibility style
                    // this.log(-2, "style.display: recovering", this.style_display_saved);
                    this.element.style.display = this.style_display_saved
                }
            }
            else { // need to hide
                if (!this.isVisible()) { // already hidden
                    // this.log(-2, "already hidden");
                }
                else {
                    // this.log(-2, "will save style.display:",this.element.style.display)
                    this.style_display_saved = this.element.style.display // save current visibility style
                    this.element.style.display = "none";
                }
            } // if visible
            if (!visible) {
                //this.log(-1, "setVisible: calling hideCallback", visible)
                this.hideCallback()
                }
            else {
                //this.log(-1, "setVisible: calling showCallback", visible)
                this.showCallback()
            }
        } // element
    }
    hideCallback() {
    }
    showCallback() {
    }
    isVisible() { // true: element is visible, false: it is hidden
        if (this.element) {
            return this.element.style.display != "none";
        }
    }
    hide() {
        this.setVisible(false);
    }
    show() {
        this.log(-1, "show")
        this.setVisible(true);
    }
    setStyles(obj) { // helper: set css style attributes
        if (this.element) {
            Object.entries(obj).forEach( // javascript
            ([key, value]) => {
                this.element.style[key] = value
            })
        }
    }
    getStyle(key) {
        if (this.element) {
            return this.element.style[key]
        }
    }
    addClasses(...classnames) { // helper: add css classess
        if (this.element) {
            classnames.forEach(classname => { 
                this.element.classList.add(classname)
            })
        }
    }
    remClasses(...classnames) { // helper: remove css classes
        if (this.element) {
            classnames.forEach(classname => { 
                this.element.classList.remove(classname)
            })
        }
    }
    fillValid() { /*//DOC
        Fills all form fields with valid test data for debugging/testing purposes.
        Iterates through all input_fields and calls their fillValid() methods.
        */
        Object.values(this.input_fields).forEach(input_field => input_field.fillValid());
    }
    fillInvalid() { /*//DOC
        Fills all form fields with invalid test data for debugging/testing purposes.
        Iterates through all input_fields and calls their fillInvalid() methods.
        */
        Object.values(this.input_fields).forEach(input_field => input_field.fillInvalid());
    }
    activate_debug_slot() { /*//DOC
        Activates debug mode by cascading to all subwidgets in this.widgets.
        Subclasses can override this and call super.activate_debug_slot() first,
        then add their own debug functionality.
        */
        Object.values(this.widgets).forEach(widget => {
            if (widget instanceof Widget) {
                widget.activate_debug_slot();
            }
        });
    }
    close() { // close this widget: remove all signal connections, delete state variables and finally the html element
        for (const [name, signal] of Object.entries(this.signals)) {
            signal.close();
        }
        delete this.signals;
        this.deleteState();
        this.deleteElement();
    }
    log(...args) { // logging helper.  Works like console.log
        // console.log("loglevel", this.loglevel, "args", args)
        if (args[0] < this.loglevel) {
            return;
        }
        args.splice(0, 1);
        args.unshift(this.constructor.name + ":" + this.id + ":");
        console.log(...args);
    }
    err(...args) { // error logging helper.  Works like console.error
        args.unshift(this.constructor.name + ":");
        console.error(...args);
    }
    setLogLevel(num) { // set the log level
        this.loglevel = num;
    }
    // state management methods follow

    setSerializationKey(key) { /*//DOC
        Sets the serialization key for this widget. Used by StateWidget to identify
        this widget's state in the URL parameters.
        :param key: string - the key to use in URL serialization
        :returns: this (chainable)
        */
        this.serializationKey = key;
        return this;
    }

    setSerializationWrite(write) { /*//DOC
        Sets whether state changes from this widget should create new browser history entries.
        :param write: boolean - if true, state changes push to history; if false, they only update current state
        :returns: this (chainable)
        */
        this.serializationWrite = write;
        return this;
    }

    getState() { /*//DOC
        Returns the current serialization state of this widget.
        Subclasses that want to participate in state serialization should override
        getSerializationValue() to return their serialized state string.
        :returns: { serializationKey: string, serializationValue: string, write: boolean } or null if not configured
        */
        if (!this.serializationKey) {
            return null;
        }
        const value = this.getSerializationValue();
        return {
            serializationKey: this.serializationKey,
            serializationValue: value,
            write: this.serializationWrite || false
        };
    }

    getSerializationValue() { /*//DOC
        Returns the serialized state value of this widget as a string.
        Subclasses should override this to provide their serialized state.
        :returns: string or null
        */
        return null;
    }

    setState(serializationValue) { /*//DOC
        Sets the widget's state from a serialized value string.
        Subclasses should override this to deserialize and apply the state.
        Should validate the value and ignore if invalid.
        :param serializationValue: string - the serialized state to apply
        */
        // Base implementation does nothing - subclasses override
    }

    serialize() { /*//DOC
        Serializes the widget's current state and emits it via signals.state_change.
        Only emits if the widget has a serializationKey configured and signals.state_change exists.
        */
        const state = this.getState();
        if (state === null) {
            this.log(-1, "serialize: no serializationKey configured, skipping");
            return;
        }
        if (this.signals.state_change == null) {
            this.log(-1, "serialize: no state_change signal, skipping");
            return;
        }
        this.log(-1, "serialize: emitting state", state);
        this.signals.state_change.emit(state);
    }
    /*
    getElement(par) {
        return this.element.querySelector(`#${par}`); // WARNING: this doesn't work in action, why!?
    }
    */

    _enhanceSlotMethods() {
        // add property 'method_addr' to all _slot methods
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        methodNames.forEach(methodName => {
        if (methodName.endsWith('_slot') && typeof this[methodName] === 'function') {
            this[methodName]["method_addr"] = `${this.constructor.name}.${methodName}`;
        }
        });
    }

    /* the API doc generator */
    getAPITree() {
        const api = {
            class: this.constructor.name,
            // path: this.constructor.sourceFile || '?', // hallucination..
            /* // add on-demand
            about: ``,
            slots: {},
            signals: {},
            widgets: {},
            components: {},
            methods: {}
            */
        };
        // Introspect this object

        const protoConstructor = Object.getPrototypeOf(this).constructor;
        const ctor_docstring = extractDocstring(protoConstructor.toString());
        if (ctor_docstring) {
            api["about"] = ctor_docstring;
        }

        // const methodNames = Object.getOwnPropertyNames(this.constructor.prototype);
        // const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        // Get all methods
        const methodNames = getAllMethodsInPrototypeChain(this);
        // console.log("All methods found:", methodNames);

        for (const key of methodNames) {
            const obj = this[key] // the method
            // console.log("introspect method:", key);
            if (typeof this[key] === 'function' && key.endsWith('_slot')) {
                if (!api.hasOwnProperty('slots')) {
                    api["slots"] = Object();
                }
                api.slots[key] = null; // a slot but not necessarily with a docstring
                // console.log("SLOT:", obj.toString());
                const docs = extractDocstring(obj.toString());
                if (docs) {
                    api.slots[key] = Object();
                    api.slots[key]["about"] = docs
                }

            } else if (typeof this[key] === 'function' && (key.startsWith("get__") || key.startsWith("set__"))) {
                if (!api.hasOwnProperty('methods')) {
                    api["methods"] = Object();
                }
                api.methods[key] = null; // a method but not necessarily with a docstring
                const docs = extractDocstring(obj.toString());
                if (docs) {
                    api.methods[key] = Object();
                    api.methods[key]["about"] = docs
                }
            }
        }

        if (Object.keys(this.signals).length > 0) {
            api["signals"] = Object();
            for (const [key, signal] of Object.entries(this.signals)) {
                api.signals[key] = null; // a signal but not necessarily with a docstring
                if (signal) {
                    const docs = signal.getDocString();
                    if (docs) {
                        api.signals[key] = Object();
                        api.signals[key]["about"] = docs
                        /*
                        if (signal.callbacks.length > 0) {
                            api.signals[key]["connect"] = [];
                            signal.callbacks.forEach(cb => {
                                if (cb.method_addr) {
                                    //console.log("cb>", cb)
                                    //console.log("cb.method_addr>", cb.method_addr);
                                    api.signals[key]["connections"].push(cb.method_addr);
                                }
                            })
                        }
                        */
                    } // signal not null
                }
                else {
                    api.signals[key] = "ERROR"
                }
            }
        }

        if (Object.keys(this.widgets).length > 0) {
            api["widgets"] = subWidgetRecurse(this.widgets);
        }

        if (Object.keys(this.components).length > 0) {
            api["components"] = subWidgetRecurse(this.components);
        }

        if (this.input_fields && Object.keys(this.input_fields).length > 0) {
            api["input_fields"] = Object();
            for (const [key, field] of Object.entries(this.input_fields)) {
                api.input_fields[key] = field.constructor.name;
            }
        }

        return api;
    }
}

class Signal {
    constructor(docstring=null) {
        this.docstring=docstring;
        this.callbacks=new Array(); // all registered callback functions for this particular signal
    }
    connect(method) { // register method that's called when emit is called
        this.callbacks.push(method);
    }
    disconnect(method) { //  deregister a callback function
        let i = this.callbacks.find(func => func == method);
        if (i>0) {
            this.callbacks.pop(i);
        }
        else {
            console.log("Signal: could not find method from callback list");
        }
    }
    emit(par) { // call all registered functions when signal is emitted
        this.callbacks.forEach(cb => {
           cb(par);
        });
    }
    close() { // close the signal: remove all callback connections
        delete this.callbacks;
    }
    getDocString() {
        if (!this.docstring) return '';

        // Split into lines and completely normalize each line
        const lines = this.docstring
            .split(/\r?\n/)
            .map(line => line.trim())  // Remove ALL leading/trailing whitespace
            .filter((line, index, arr) => {
                // Remove empty lines at start and end, but keep internal empty lines
                if (line === '') {
                    return index > 0 && index < arr.length - 1 &&
                           arr.slice(0, index).some(l => l !== '') &&
                           arr.slice(index + 1).some(l => l !== '');
                }
                return true;
            });

        return lines.join('\n');
    }
}


class ElementWidget extends Widget { /*//DOC
    Dummy widget: just register the html element for this widget
    */
    constructor(id) {
        super();
        this.id = id
        this.createElement();
        this.createState();
    }
    createSignals() {};
    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
    };
    createState() {};
}

class DummyWidget extends Widget { /*//DOC
    A dummy debugging widget: everything that comes to the slot
    is just dumped to the console
    */
    constructor() {
        super();
        this.createElement();
        this.createState();
    }
    slot(par) { /*//DOC
        Everything coming to this slot is dumped to the debug console
        */
        this.log(0, "got ", par)
    }

    createSignals() {};
    createElement() {};
    createState() {};
}

class DumpWidget extends Widget { /*//DOC
    data arriving to slot is
    stringified & dumped into the DOM    
    */
    constructor(id) {
        super();
        this.id = id;
        this.createElement();
        this.createState();
    }
    slot(par) { /*//DOC
        Everything coming to this slot is dumped to the debug console but
        also stringified and dumped to the html element of this widget
        */
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

export { Widget, Signal, DummyWidget, DumpWidget, ElementWidget,
    assertKeys, getPageParameters, equalSets, uuidv4, boxify, csv2obj, obj2csv, randomID, isDOMElement };
