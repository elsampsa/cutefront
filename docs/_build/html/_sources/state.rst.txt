State de/Serialization
======================

Your widget/html page has a state.  It can be a complex combination of active checkboxes,
currently active tab(s), forms with information filled in, etc.

Suppose you want to send a link to a colleague, who by opening the link, 
ends up exacly in the same place in the page with the same submenus and tabs and whatnots activated.

This process is referred to as (de)serialization of the page: the link with its URL encoded parameters encodes/serializes
information about the state of the SPA which can then be deserialized in another time and place in order to end up exactly in the
same place on the page.

It also makes it possible to use the browser's forward and backward buttons to navigate your browsing history.

Widgets that wish to de/serialize their state need to define a few methods.

.. code:: javascript

    // define this signal in createSignals():
    this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
    // define these two methods:
    getSerializationValue() { 
        /* serialization: returns a string that represents 
        the serialization of this widget */
    }
    setState(serializationValue) { 
        /* deserialization: take that same string and modify widget
        so that it goes to the desired state */
    }
    
When a widget's state changes and it wants to save that state, it should call internally ``this.serialize()``

.. warning::

    As your widgets' internal interactions grow increasingly complex, be sure that `setState()` only deserializes and does nothing else!
    You might end up in a situation where you accidentally call `serialize()` downstream every time you call `setState()`, messing up the state management.
    It is a good idea to use serialization guard parameter, say boolean `this.serialize_` to be on the safe side.

``StateWidget`` is responsible for gathering all key value pairs from all widgets and creating the overall serialization into the URL browser bar:

.. code:: javascript

    const stateWidget = new StateWidget();
    stateWidget.setLogLevel(-1); // debugging
    ...
    // Configure state management for yourWidget:
    yourWidget.setSerializationKey("your-key").setSerializationWrite(true);
    stateWidget.register(yourWidget); // remember to register all your serializable widgets here,
    // .. i.e. yourWidget1, yourWidget2, etc.

This creates an URL-encoded key-value pair into the addres bar: ``&your-key=value``, where value is produced by ``getSerializationValue()``.

Using ``.setSerializationWrite(true)`` indicates that the URL bar should be updated (writing the composite serialization of all widgets therein) 
and that a write to the browser history should be done always when ``yourWidget`` serializes.

One final note: when creating widgets with ``href`` links, use `preventDefault()`, otherwise you will create extra entries to the state history, 
messing it up.  So use this when 

.. code:: javascript

   this.itemElement.onclick = (event) => {
       event.preventDefault();  // Prevent "#"" from being added to URL
       ...
   };



For more details, please see the fullstack FastAPI example.

