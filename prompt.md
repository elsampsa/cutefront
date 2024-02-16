Hi!  Let's do some development with CuteFront.  It is a pure-javascript and HTML framework.  It is similar to the Qt desktop framework.  Let's summarize how it works:

Widgets are written in javascript.  CSS and HTML from bootstrap version 5 are used.

A Widget creates it's corresponding HTML code to the DOM with javascript.

Widgets emit signals.

Widgets have slots for receiving signals from other widgets.

Code for each widget resides in a separate .js file.

Signals and slots between widgets instances are explicitly connected in the main html file.

A state of the widget is cached in the HTML elements (say, the state of a radio button).  This is the preferred
way to maintain the state.  If needed, some part of the state can also be cached to internal member variables (say, this.some_boolean_flag, etc.).

When user interacts with a widget (say, with a click or typing something), the widget's internal state is changed (say, contents of a text field or a radio button state).  This interaction can result in a signal being emitted.

When a widget receives a signal to a slot, this typically results in its internal state (and its HTML) being changed.

Now I will give you an example how to define a basic widget class ``HateLike`` in file ``hatelike.js`` and it's accompanying html file
``hatelike.html`` that shows how to test a widget and how to connect signals to slots.

```javascript
/*Beginning of file "hatelike.js"

This file defines a widget class "HateLike" with a collapsable bootstrap accordeon.  Within the accordeon, there is a radio button
with two choises: "I like it" and "I hate it".  There is also a text field that shows how many times the user has
clicked either "I like it" or "I hate it".  Each like increments the text field value by one, while each hate decreases it by one.

Each time a user clicks any of the radio buttons, a text message signal is also emitted from the widget.  This can be connected to other widget instances.

The widget also has a slot that receives a text message signal from some other widget.  If the incoming signal text includes the word "like" then the
text field value is incremented by one, if it includes text "hate", then it is decreased by one.
*/
import { Widget, Signal, uuidv4 } from '../lib/base/widget.js';

/* Widget is the base class for all widgets.
Please, put always the methods described below in the same order:
constructor, createSignals, _slot functions, createState, createElement
The class, signals and slots should be documented with a string starting
with "//DOC" to facilitate autodocumentation
*/
class HateLike extends Widget { /*//DOC
    Has two radio buttons with choices "I Like it" and "I hate it".
    Shows a text field how many times it has been liked or hated
    */
    constructor(id) { // Usually, the constructor should only accept a single parameter (id).
        /* The id parameter is an html element's id attribute that is used to identify this.element in createElement() method
        default values for internal state should be set in the createState() method instead
        */
        super(id); // calls createSignals() and sets this.id = id
        this.createElement();
        this.createState();
    }
    createSignals() { /* Define signals sent by this widget.
    After each signal definition, there should be a comment what the signal carries and what it is about.
    This method must always be defined, even it the widget didn't use any signals, in which case it is just an empty function.
    */
        this.signals.message = new Signal(); /*//DOC Carries a string.  Message that depends which radiobutton has been clicked. */
    }
    /* Next define slots where this widget can receive signals from other widgets.
    Please use always the "snake-case" syntax for slots and always include "_slot" in the name of the function,
    for example in this case, instead of "inputTextSlot", the name is "input_text_slot".
    Each slot should have a comment that describes what kind of datatype and/or what kind a nested json object scheme it expects.
    You can even implement type and json scheme testing.
    */
    input_text_slot(txt) { /*//DOC
        Receives a text message from another widget
        Input txt is a string
        */
        // this.txt = structuredClone(txt) // if we would cache the data coming with the signal, we should make an immutable copy of it
        if (txt.includes("like")) {
            this.flike()
        }
        else if (txt.includes("hate")) {
            this.fhate()
        }
    }
    createState() { /* Initializes state variables created by createElement (see below).
        Creates additional state variables if necessary.
        */
        if (this.element == null) { // this check must always be included
            return
        }
        // this.txt = null // if we would cache in the state the text received in function input_text_slot 
        // state variables created in createElement (see below):
        this.counter_field.innerHTML='0'
        this.like.checked = true; // initial value: the "I Like it" radio button is enabled
    }
    createElement() { /* Hooks into an existing html element and creates dynamically the html of this particular widget into the DOM.
        Fields of the DOM elements of the dynamically created widget html are used as member state variables of the widget.
        Callbacks are also attached to buttons, etc. interactive elements.
        */
        this.element = document.getElementById(this.id)
        if (this.element == null) { // this check must always be included
            this.err("could not find element with id", this.id)
            return
        }
        /* Generate some UUIDs.  These are required for unique "id" attributes for the html elements.
        When a new widget is instantiated, each one of them should have their own unique set of html elements identified by a unique "id" attribute.
        Same goes for html # targets.
        */
        let head=uuidv4();
        let ctarget=uuidv4();
        let name=uuidv4();
        let uuid1=uuidv4();
        let uuid2=uuidv4();
        let uuid3=uuidv4();
        // Create the HTML corresponding to this widget
        this.element.innerHTML=`
        <div class="accordion-item">
            <h2 class="accordion-header" id="${head}">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${ctarget}" aria-expanded="true" aria-controls="${ctarget}">
                    Do you like CuteFront?
                </button>
            </h2>
            <div id="${ctarget}" class="accordion-collapse collapse show" aria-labelledby="${head}" data-bs-parent="#${this.id}">
                <div class="accordion-body">
                    <div class="btn-group-vertical" role="group" aria-label="Basic radio toggle button group">

                        <input type="radio" class="btn-check" name="${name}" id="${uuid1}" autocomplete="off">
                        <label class="btn btn-outline-primary" for="${uuid1}">I like it</label>
                    
                        <input type="radio" class="btn-check" name="${name}" id="${uuid2}" autocomplete="off">
                        <label class="btn btn-outline-primary" for="${uuid2}">I hate it</label>

                        <p>Overall points:<div id="${uuid3}"></div></p>
                    </div>
                </div>
            </div>
        </div>
        `
        // Get handles to relevant DOM elements and use them as member state variables
        let inputs = this.element.getElementsByClassName("btn-check");
        this.counter_field = document.getElementById(uuid3);
        this.like = inputs[0];
        this.hate = inputs[1];
        this.like.onclick = (event) => { // use always the "= (event) => {}" syntax
            this.flike();
            this.signals.message.emit("I like Cutefront")
        }
        this.hate.onclick = (event) => { // use always the "= (event) => {}" syntax
            this.fhate();
            this.signals.message.emit("I hate Cutefront")
        }
    }
    flike() {
        /* Note how we are using the DOM html element value this.counter_field.innerHTML as a state variable
        instead of creating an additional state variable (say, this.counter).
        Prefer always DOM html element values themselves as state variables.
        */
        let i = parseInt(this.counter_field.innerHTML) + 1;
        this.counter_field.innerHTML = i.toString();
        this.err("report an error")
        // Logging is done like this:
        // this.log(0, "some normal-level logging")
        this.log(-1, "flike called");
    }
    fhate() {
        let i = parseInt(this.counter_field.innerHTML) - 1;
        this.counter_field.innerHTML = i.toString();
    }
    getCount() { // if we'd need to query the widget about the state of the counter
        return parseInt(this.counter_field.innerHTML);
    }

} // HateLike

/*
Please note that createElement() is used strictly for generating the HTML code and 
to get handles of the relevant DOM elements into member variables (for example, this.like, this.counter_field.innerHTML, etc.)

You should set values of the DOM elements in createElement().

Modifying the state and setting DOM element values should be done outside createElement(), for example in createState() and other
functions called by the _slot functions.
*/

export { HateLike }
/*End of file "hatelike.js" */
```

```html
<!--
Beginning of file "hatelike.html"
Every widget comes with accompanying html code for basic visualization and testing
This is for class HateLike in file "hatelike.js"
-->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HateLike Test</title>
<link href="../lib/bootstrap-5.2.3-dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<!-- widget javascript code will hook into these: -->
<div class="accordion" id="test1"></div>
<div class="accordion" id="test2"></div>

<!-- You can create buttons, etc. here to test interaction with the widget: -->
<button id="test-button">test something</button>

</body>
<script src="../lib/bootstrap-5.2.3-dist/js/bootstrap.bundle.min.js"></script>
<!-- 
additional libraries are typically in ../lib/include/
plotly:
<script src="../lib/include/plotly/js/plotly-2.20.0.min.js"></script> 
marked:
<script src="../lib/include/marked/js/marked.min.js"></script>
-->

<script type="module">

import { DummyWidget } from '../lib/base/widget.js';
import { HateLike } from './hatelike.js';
var dummy_widget = new DummyWidget();
var test1 = new HateLike("test1");
var test2 = new HateLike("test2");

test1.setLogLevel(-1); // debugging
test2.setLogLevel(-1); // debugging

/* Connect signals for debugging with DummyWiget that simply dumps the signal data to the console

Important: when connecting widget's signal to another widget's slot, always use the "bind" syntax!
*/
test1.signals.message.connect(
    dummy_widget.slot.bind(dummy_widget)
);
test2.signals.message.connect(
    dummy_widget.slot.bind(dummy_widget)
);
// connect signal from one widget to another
test1.signals.message.connect( // signal from test1 to test2
    test2.input_text_slot.bind(test2)
);
test2.signals.message.connect( // signal from test2 to test1
    test1.input_text_slot.bind(test1)
);

// if user requests signal sending buttons for the test html, use always this syntax
let button = document.getElementById("test-button"); // if we'd use the test button
button.onclick = () => {
    test1.input_text_slot("I like it");
};

</script>
<!-- 
End of file "hatelike.html"
-->
```
Now that you now how to construct basic CuteFront widgets, let's expand the idea for you a bit more.

In addition to basic widgets, there can be "child widgets" that are owned by basic widgets (aka parent widgets).

A typical example would be a list (= basic / parent widget) that owns list items (= child widgets).

The child widget's ``constructor()`` and ``createElement()`` methods look a bit different:

```javascript
class SomeChildWidget extends Widget { /*//DOC
    A list element for some parent widget
    */
    constructor() { // we don't need the id as the html element is created by the widget itself
        super(null); 
        this.createElement();
        this.createState();
        }

    createSignals() { // create the signals
    }

    createElement() {
        /* does not use this.id to hook up to an existing html element in the html code
        but creates a new element from scratch instead
        */
        this.element = document.createElement("tr"); // i.e. instead of document.getElementById(this.id)
        // etc. etc.
    }

    getElement() { // called by the parent widget
        return this.element
    }
    // etc.
}
```
In the list and list item example, the parent widget would create child widgets on-the-fly and cache them into a list.

It can then query it's child widget's HTML DOM element from their ``getElement()`` and attach it to it's own DOM tree / remove it from it's own DOM tree when necessary, etc.

I hope you got it!  Briefly, I will ask you for widgets.  Please, always provide me with both the .js and accompanying .html files.  

I know you're excited, but please do not provide any files if I don't ask for it explicitly.  :)

Thank you!
