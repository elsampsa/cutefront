 
.. _creating:

Creating and Using Widgets
==========================

The best way to learn to create widgets, is to study the code in
the :ref:`widget library <library>`.  This section serves as a reference.

Subclassing a Widget
--------------------

Creating a new widget is always done in the same way:

.. code:: javascript

    import { Widget, Signal } from './widget.js';
    // import { Widget, Signal } from '../lib/base/widget.js'; // app-specific widget
    class CrudButtonsWidget extends Widget {
        // widget definition here
    }

If you're creating an app-specific widget into the ``app`` directory,
as described in :ref:`code organization <codeorg>`, remember to
use the correct relative path, i.e.:

.. code:: javascript

    import { Widget, Signal } from '../lib/base/widget.js';

Constructor
-----------

Constructor always takes in an ``id`` string.  Typically it is the id of the html element
the widget attaches to

.. code:: javascript

    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

Note that ``super()`` sets ``this.id`` and 
calls ``createSignals`` (see below) automatically.

If you use class inheritance, call ``createElement()`` and
``createState()`` only in the base class, not in the inherited classes
(i.e., no need to call them multiple times).

Logging
-------

Logging from within the widget code is done like this:

.. code:: javascript

    this.err("report an error")
    this.log(0, "some normal-level logging")
    this.log(-1, "some debug-level logging")

These work like ``console.log``, i.e. feel free to add all optional arguments you want.

When using the widget, you can set the loglevel like this:

.. code:: javascript

    var widget = YouWidget("some-id")
    widget.setLogLevel(-1); // debugging

When setting loglevel ``-1``, all calls to ``this.log(N, ..)``  with ``N>=-1`` are printed to the console, i.e.
going "down" with negative numbers mean less significant messages.

Defining Signals
----------------

Define signals like this, into the ``this.signals`` "namespace":

.. code:: javascript

    createSignals() { /*
        After each line, declare what datatype the signal carries and when it is emitted.
        */
        this.signals.create = new Signal(); // Carries nothing.  Emitted on new record creating.
        this.signals.update = new Signal(); // Carries nothing.  Emitted on record update.
        this.signals.delete = new Signal(); // Carries uuid string of the datum.  Emitted when a record is deleted
    }

In the comments, you should always write what kind of variable / data structure the signal is carrying

Initialize State
----------------

An example of a widget that would cache a json object ``current_datum``:

.. code:: javascript

    createState() {
        if (this.element == null) {
            this.err("no element created")
        }
        this.current_datum = null
    }

Slot Methods
------------

Let's consider a slot that receives a signal carrying a json object "datum"

.. code:: javascript

    current_datum_slot(datum) { /*
        Comment here what kind of data the slot expects:
        datatype and/or a nested json object scheme.
        You can also implement a datatype check.
        */
        if (datum == null) {
            // change state, say hide buttons
            this.current_datum = null
        }
        else {
            this.current_datum = structuredClone(datum)
        }
    }

The signal that comes into the slot, alters the internal state of the
widget (that was created in ``createState`` above).

In this particular case we create a copy of the object.  You might or might not need
to do this.  Consider situation where you send an object to a slot and then it is changed
elsewhere in the code: in such situation your slot function needs to create its own copy 
of the object in order to keep it's state under control.

.. _docstrings:

Creating Autodocumentation
--------------------------

Structuring the code in the CuteFront way, makes reading it easy:

Taking a quick look into the the subclassed ``createSignals`` and
various (well commented) ``slot`` functions immediately gives you a clear
idea of the widget's API, while looking at ``createState`` shows you all the 
internal state variables of the widget.

The associated, minimal testing ``html`` file demonstrates actual use with
dummy data.

To facilitate autodocumentation even further, `a python script <https://github.com/elsampsa/cutefront/blob/main/script/docextract.py>` 
is provided that documents your widget's API, when you write comments enclosed in ``/*//DOC`` and ``*/``.  Like this:

.. code:: javascript

    class SampleListWidget extends Widget { /*//DOC
        A list of samples with their datetime strings and statuses 
        (polished or not).
        */

    ...
    ...

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

    ...
    ...

When requesting markdown format, the script gives this output:

.. code:: text

    ### SampleListWidget
    - file: `samplelist.js`
    - inherits: `Widget`
    - A list of samples with their datetime strings and statuses
        <br> (polished or not).
    - SIGNAL: new_sample
        <br> Carries a sample object {uuid:string, datetime:string, data:2D profile}.
        <br> Emitted when a new sample is added to this list (i.e. a "relay" signal).
    - SIGNAL: chosen_sample
        <br> Carries a sample object {uuid:string, datetime:string, data:2D profile}.
        <br> Emitted when a sample is clicked highlighted in the list
    - SLOT: new_sample_slot(sample)
        <br> input is an object with
        <br> uuid: uuid string
        <br> datetime: datetime string
        <br> data: a 2D profile
    ...
    ...

Using the DOM
-------------

.. _createelement:

The ``createElement`` method is used to insert the HTML code of the widget into the 
document object model (DOM).  

In this method, you will also hook into the various DOM elements (fields, buttons, etc.)
and use them as member variables.  These member variables constitute the *state* of the widget
and their contents (and the state) is then modified in other methods of your widget class
(for example, in ``createState``).

You should always try to use the DOM elements themselves as state variables, instead of creating
extra member state variables, i.e.:

.. code:: javascript

    this.element.innerHTML = `
        ...
        <input type="text" id="name">
        ...`
    ...
    this.name_field = this.element.querySelector("#name");
    this.name_field.value // use this as your member state variable
    // don't create an extra this.name string variable that you need to synchronize with this.name_field.value

``createElement`` is the most "nasty" part of your widget you need to write (who wants to write HTML and
manipulate it programmatically), but fortunately, it can be done to great extent using :ref:`AI assistants <chatgpt>`.

``createElement`` should always start the same way:

.. code:: javascript

    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
        // create child elements to this.element
        // attach callbacks to signals, etc.
    }


Creating new child elements for ``this.element`` is most conveniently done like this:

.. code:: javascript

    this.element.innerHTML=`
    <thead>
    </thead>
    <tbody>
    </tbody>
    `

Where we have created table header and table body child elements under ``this.element``

Then accessing *those* elements, you can continue like this:

.. code:: javascript

    this.thead = this.element.getElementsByTagName("thead").item(0)
    this.body = this.element.getElementsByTagName("tbody").item(0)

Or access them on a per-class basis:

.. code:: javascript

    this.some_element = this.element.getElementsByClassName("some-class")[0]

Or access them consecutively:

.. code:: javascript

    this.some_element = this.element.children[0]

Alternatively, you can create them in js, and then attach as children to
``this.element``:

.. code:: javascript

    this.thead = document.createElement("thread")
    this.element.appendChild(this.thread)

Setting the css classes:

.. code:: javascript

    this.some_element.className="bg-black whatever"
    this.some_element.classList.add("anotherclass");
    this.some_element.classList.remove("anotherclass");

Assuming you have created a button element ``this.alert_button`` in ``createElement`` 
method, and want to call a method named ``internalMethod`` in your widget when a button is
clicked, you would do this in ``createElement``:

.. code:: javascript

    this.alert_button.onclick = (event) => { // CORRECT
        this.internalMethod()
    }

However, NOT like this:

.. code:: javascript

    this.alert_button.onclick =  this.internalMethod // WRONG WRONG WRONG

i.e. *always* define a lambda function.

In the former case, ``this`` refers correctly to the present widget object
instance while in the latter case ``this`` will become foobar.  Please see below
for the pitfalls with ``this``.


Emitting Signals
----------------

Emitting signals from within your widget is as simple as:

.. code:: javascript

    this.signals.signal_name.emit(variable)

Where ``variable`` is whatever (typically a json object) you want to
carry with the signal and what the corresponding receiving slot (in another widget)
knows how to handle.

Many times you just send nothing with the signal, i.e. like this:

.. code:: javascript

    this.signals.signal_name.emit()

If you want to emit a signal directly from an html element callback, this is the correct
way to do it (see previous subsection and the "The Trouble with This" subsection below):

.. code:: javascript

    this.some_button.onclick = (event) => {
        this.signals.signal_name.emit(variable);
    }


Connecting Signals
------------------

Considering two widget instances, ``from_widget`` and ``to_widget``, connecting
a signal from the former to a slot of the latter, is done like this:

.. code:: javascript

    from_widget.signals.signal_name.connect(
        to_widget.slot_name.bind(to_widget));

Let's recap that:

.. code:: javascript

    FROM.signals.signal_name.connect(
        TO.slot_name.bind(TO));

What is that ``bind`` and why ``TO`` is repeated?  This has to do with
the curiosities of ``this`` in javascript (see below).

You might also want to pass the signal through a lambda function, in order
to do something more than just to connect it directly to a slot:

.. code:: javascript

    from_widget.signals.signal_name.connect(
        (par) => {
            // do more stuff
            console.log("signal sending par", par);
            to_widget.slot_name.bind(to_widget)(par)
        }
    )


Create test HTML
----------------

Each widget should always be accompanied with corresponding, minimal test html file.  This html file
can then be opened in the :ref:`plainfile development environment <plainfile>`.

It can also be used for automatic testing, with selenium and the like.

Let's suppose you have:

- Defined ``MyWidget`` in file ``mywidget.js`` in the :ref:`app directory <codeorg>`
- ``MyWidget`` has only one signal named ``ping``

An example corresponding ``mywidget.html`` test html is below.  For app-specific widgets, you would
place it in the ``app`` folder.  Again, be carefull with the ``<link href=..>`` to set the correct path for
css inclusion and with ``<script src=..>`` for javascript inclusion, depending on your 
:ref:`code organization scheme <codeorg>`.

.. code:: html

    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Widget Test</title>
    <!-- for app-specific widgets: -->
    <link href="../lib/bootstrap-5.2.3-dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <div id="test-element" class=""></div>
    <button id="test-button">test something</button>

    </body>
    <!-- for app-specific widgets: -->
    <script src="../lib/bootstrap-5.2.3-dist/js/bootstrap.bundle.min.js"></script>
    <script type="module">
    /* // define mock data if you need that
    var data = [
    ];
    */
    import { DummyWidget } from '../lib/base/widget.js'; // for app-specific widgets
    import { MyWidget } from './mywidget.js';
    var dummy_widget = new DummyWidget();
    var widget = new MyWidget("test-element");
    widget.setLogLevel(-1); // debugging

    // connect your widget's signals to the DummyWidget
    widget.signals.ping.connect(
        dummy_widget.slot.bind(dummy_widget) // simply dumps the signal data to the console
    );

    // test your slots by calling directly
    // widget.some_slot();

    let button = document.getElementById("test-button");

    // or test your slot interactively
    button.onclick = () => {
        widget.some_slot();
    };

    </script>


.. _this_problem:

The Trouble with "this"
-----------------------

Javascript's ``this`` object is not, unfortunately completely equivalent 
to python's ``self`` object, but a much more 
`tedious thing <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>`_

When called inside an object instance's member function ``this`` refers
to the current object (like in Python).  However, if the member function is
passed to another function, ``this`` context changes and refers to the another
function instead - in order to avoid this, use lambda functions to define signal
callbacks (as suggested above).

``this`` can be bound explicitly to the current object with
`bind <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind>`_.
This is used when connecting signals to slots as discussed above.

As a rule of thumb, always when passing an object member function as a parameter,
always use ``bind``.  When creating callbacks in object methods, 
always define a local lambda function.


Parent / Child Widget Structures
--------------------------------

In some cases, widgets should instantiate other widgets (child widgets).

A typical case is a widget that implements a list of items (say, a list of cards, each card having several fields corresponding to some data).

Say, you would have ``YourListWidget`` (parent) that instantiates and caches several ``YourListItemWidget`` (child) instances.

Then ``YourListItemWidget`` would look something like this:

.. code:: javascript

    constructor() { // we don't need the id as the html element is created by the widget itself
        super(null); 
        this.createElement();
        this.createState();
        }

    createElement() {
        // does not use this.id to hook up to an existing html element in the html code
        // but creates a new element from scratch instead
        this.element = document.createElement("tr"); // i.e. instead of document.getElementById(this.id)
        // etc. etc.
    }

    getElement() { // maybe called by the parent widget
        return this.element
    }

There are quite many ways to manage the intercommunication between the parent and its child widgets and the details are up to you.




