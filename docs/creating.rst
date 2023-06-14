 
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
    class CrudButtonsWidget extends Widget {
        // widget definition here
    }


Constructor
-----------

Constructor always takes in an ``id`` string.  Typically it is the id of the html element
the widget attaches to

.. code:: javascript

    constructor(id) {
        super();
        this.id=id;
        this.createElement();
        this.createState();
    }

Note that ``super()`` calls ``createSignals`` (see below) automatically.


Logging
-------

Logging from within the widget code is done like this:

.. code:: javascript

    this.err("report an error")
    this.log(-1, "some logging")

These work like ``console.log``, i.e. feel free to add all optional arguments you want.

When using the widget, you can set the loglevel like this:

.. code:: javascript

    var widget = YouWidget("some-id")
    widget.setLogLevel(-1); // debugging


Defining Signals
----------------

Define signals like this, into the ``this.signals`` "namespace":

.. code:: javascript

    // UP: signals
    createSignals() {
        this.signals.create = new Signal(); // C // carries nothing
        this.signals.update = new Signal(); // U // carries nothing
        this.signals.delete = new Signal(); // D // carries uuid of the datum
    }

In the comments, you should always write what kind of variable / data
structure the signal is carrying

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

    current_datum_slot(datum) {
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

Code as Documentation
---------------------

Structuring the code in the CuteFront way, "autodocuments" the code to some extent.

Taking a quick look into the the subclassed ``createSignals`` and
various (well commented) ``slot`` functions immediately give you a clear
idea of the widget's API, while looking at ``createState`` shows you all the 
internal state variables of the widget.

The associated, minimal testing ``html`` file demonstrates actual use with
dummy data.

Using the DOM
-------------

The ``createElement`` method is used to hook into and manipulate the document object
model (DOM).

It should always start the same way:

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

.. code::

    from_widget.signals.signal_name.connect(
        (par) => {
            // do more stuff
            console.log("signal sending par", par);
            to_widget.slot_name.bind(to_widget)(par)
        }
    )

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










