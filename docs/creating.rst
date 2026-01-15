 
.. _creating:

Creating and Using Widgets
==========================

The best way to learn to create widgets, is to study the code in 
the :ref:`widget library <library>` and in the FastAPI fullstack example.

Of course, typically you don't write the widgets yourself, but let your favorite AI buddy to do 
the grunt work.  Your role is mainly testing and keeping your buddy in check.

Subclassing a Widget
--------------------

Creating a new widget is always done in the same way:

.. code:: javascript

    import { Widget, Signal, randomID } from './widget.js'; // we're creating a library widget
    // import { Widget, Signal, randomID } from '../lib/base/widget.js'; // we're creating an app-specific widget
    class CrudButtonsWidget extends Widget { /*//DOC
        Explain your class in here
        */
    }

If you're creating an app-specific widget into the ``app`` directory,
as described in :ref:`project organization <install>`, remember to
use the correct relative path, i.e.:

.. code:: javascript

    import { Widget, Signal } from '../lib/base/widget.js';


.. tip:: 

    Use the /*//DOC syntax when writing docstrings for your class and for your _slot functions: they will help you
    down the line with autodocumentation


Constructor
-----------

Constructor takes in an ``id`` string.  It is the id of the html element the widget attaches to

.. code:: javascript

    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

Note that ``super()`` sets ``this.id`` and  calls ``createSignals`` (see below) automatically.

Your widget can also be a "floating" widget that is attached later onto something (HTML element or another widget), in this
case define ``id`` as ``null``.

If you plan to subclass your widget and subclasses are setting initialization parameters, use the *builder pattern* instead:

.. code:: javascript

    constructor(id) {
        super(id);
    }

    setSome(pars) {
        // do something with the pars here
        this.createElement();
        this.createState();
        return this; // chainable method
    }

Now when you instantiate the widget:

.. code:: javascript

    const yourWidget = YourWidget("id").setSome(pars);

i.e. ``setSome`` is responsible in creating the HTML elements and the state, as they might depend in the ``pars`` and
you can also subclass the method ``setSome`` easily.

.. warning::

    In object-oriented Javascript, you cannot call subclassed member functions from the constructor (like you would do in python)

.. tip:: 

    When writing object-oriented (OO) code and inheritance, your inheritance diagram should be max.
    3 layers deep.  If it gets deeper than that, you should consider using the "delegate pattern" instead, i.e.
    create separate classes that have clear separate of concerns.  Take a look for example into the DataSource, DataModel and
    DataWidget implementation in the FastAPI fullstack example.

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

    createSignals() {
        this.signals.create = new Signal('Carries nothing.  Emitted on new record creating.');
        this.signals.update = new Signal('Carries nothing.  Emitted on record update.');
        this.signals.delete = new Signal('Carries uuid string of the datum.  Emitted when a record is deleted');
    }

In the comments, you should always declare what kind of variable / data structure the signal is carrying

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

    current_datum_slot(datum) { /*//DOC
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

.. tip:: 

    Slots of your widget should be order and timing-independent: calling two different slots
    either one first, should put the widget into the same state.  This will avoid you a lot of
    headache and race-conditions down the line.

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

Each time when you instantiate an object from your widget class, new html is created dynamically at that moment by the
``createElement`` method.  Supposing you would create five objects, that would insert five times the html code
``<input type="text" id="name">`` into the DOM

However, *id attributes should be unique*, so let's fix that code a bit:

.. code:: javascript

    let uuid1=randomID();
    this.element.innerHTML = `
        ...
        <input type="text" id="${uuid1}">
        ...`
    ...
    this.name_field = this.element.querySelector(`#${uuid1}`);
    
Which keeps the ``id`` argument for each widget instance unique.

``createElement`` is the most "nasty" part of your widget you need to write (who wants to write HTML and
manipulate it programmatically), but fortunately, your AI buddy is there to help!

``createElement`` should always start the same way:

.. code:: javascript

    createElement() {
        this.autoElement();
        if (this.element == null) { // if this is not a floating widget..
            this.err("could not find element with id", this.id)
            return
        }
        // create child elements to this.element
        // attach callbacks to signals, etc.
    }


``autoElement()`` inspects ``this.id`` (which you set in constructor when calling ``super(id)``):

- if ``this.id`` is an HTML element, sets ``this.element = this.id``
- if ``this.id`` is a string, searches for the id in the DOM and sets the corresponding DOM element to ``this.element``
- if ``this.id`` is null or undefined, create a new orphan div element for ``this.element``

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

    this.thead = document.createElement("thead") // tag names "div", "span", etc.
    this.element.appendChild(this.thead)

Setting the css classes:

.. code:: javascript

    this.some_element.className="bg-black whatever"
    this.some_element.classList.add("anotherclass");
    this.some_element.classList.remove("anotherclass");

Assuming you have created a button element ``this.alert_button`` in ``createElement`` 
method, and want to call a method named ``internalMethod`` in your widget when a button is
clicked, you would do this in ``createElement``:

.. code:: javascript

    this.alert_button.onclick = (event) => {
        this.internalMethod()
    }

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

If you want to emit a signal directly from an html element callback, just do this:

.. code:: javascript

    this.some_button.onclick = (event) => {
        this.signals.signal_name.emit(variable);
    }

Emitting signals from ``href`` links, you should always use `preventDefault()` so that `#` is not added
into the browser URL bar (creating extra browser history):

.. code:: javascript

   this.itemElement.onclick = (event) => {
       event.preventDefault();  // Prevent "#"" from being added to URL
       ...
   };


Connecting Signals
------------------

Considering two widget instances, ``from_widget`` and ``to_widget``, connecting
a signal from the former to a slot of the latter, is done like this:

.. code:: javascript

    from_widget.signals.signal_name.connect((par) => {
            to_widget.slot_name(par)
        })

i.e. use always a lambda function.

Subwidgets
----------

.. _subwidgets:

Widgets can be nested in hierarchies. A typical example would be a "mother" widget that represents tabs or sections
and then each one of those sections is another "child" widget.

For this purpose we introduce more namespaces in addition to the ones discussed already.

.. code:: javascript

    this.signals // namespace for signals
    some_slot // slot functions end always with _slot
    this.widgets // namespace for subwidgets
    this.components // namespace for subwidgets that are not visible for the API user
    this.input_fields // namespace for InputField instances

Suppose we have a ``TabWidget`` instance with different tabs.  Each tab encapsulates another widget.  One of the tabs encapsulates
a widget from ``UserData`` class.  You would address an input field representing user's name like this:

.. code:: javascript

    tabWidget.widgets.sectionWidget.widgets.userData.input_fields.name

When connecting signals and slots of composite widgets, you use this namespace addressing, i.e.

.. code:: javascript

    someWidget.user_signal.connect((userdata) => {
        tabWidget.widgets.sectionWidget.widgets.userData.data_slot(userdata)
        })

Or you might want to isolate the API at higher level:

.. code:: javascript

    someWidget.user_signal.connect((userdata) => {
        tabWidget.data_slot(userdata)
        })

In that case you would have defined ``data_slot`` for ``TabWidget`` which would then take care of routing the
signal to its internal, deeper level widgets.

Test HTML
---------

Each widget is always accompanied with corresponding, minimal test html file.  This html file
can then be opened in the :ref:`plainfile development environment <devenvs>`.

It can also be used for automatic testing, with selenium and the like.

Let's suppose you have:

- Defined ``MyWidget`` in file ``mywidget.js``
- ``MyWidget`` has only one signal named ``ping``

An example corresponding ``mywidget.html`` test html is below.  For app-specific widgets, you would
place it in the ``app`` folder.  

.. code:: html

    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Widget Test</title>
    <!-- for app-specific widgets: -->
    <link href="../lib/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <!-- if you use fontawesome:
    link href="../lib/include/fontawesome/css/all.min.css" rel="stylesheet" 
    -->
    </head>
    <body>

    <div id="test-element" class=""></div>
    <button id="test-button">test something</button>

    </body>
    <!-- for app-specific widgets: -->
    <script src="../lib/bootstrap/js/bootstrap.bundle.min.js"></script>
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
    widget.signals.ping.connect((par) => {
        dummy_widget.slot(par) // simply dumps the signal data to the console
    );

    // test your slots by calling directly
    // widget.some_slot();

    let button = document.getElementById("test-button");

    // or test your slot interactively
    button.onclick = () => {
        widget.some_slot();
    };

    </script>





