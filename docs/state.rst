 
.. _state_history:

State History
=============

We have been contrasting the HTML + javascript based vs. Qt based GUI development frameworks.

As discussed in :ref:`the appendum <appendum>`, the web browser has - because of it's original purpose of being just a "file browser" -
the extremely nice feature of being able to move forward and backward in the browsing history.

In the context of modern webapps, these buttons allow you to go forth and back in the *state history*.  This is a feature that
is *not* offered by default by Qt or by any modern GUI framework (to my knowledge), for obvious reasons.

Modern webapps with lots of javascript in the frontend, either offer this possibility correctly, or make a total mess out of it
(*"I clicked the back-button, and now it jumped to god-knows where!"*), while classical, "bronze-age" webapps (see :ref:`appendum <appendum>`)
that actually *do* jump from one html file to another, offer this possibility OK by default.

As you might have noticed, the state of a webapp is *encoded* in the URL address bar like this:
``http://www.example.com?par1=kikkelis&par2=kokkelis``, where in this case, the page carries two state parameters, ``par1`` with value ``kikkelis`` and so forth.

You can also copy-paste such URL addresses and send them to someone else, so then that person can go to the page and reach the desired state directly.

CuteFront offers a consistent way of saving the state and handling the state history.  Please check out a working demo in
`here <https://elsampsa.github.io/cutefront/lib/base/ballplayer2.html>`_
(and remember to try browser's forward/backward buttons after throwing the ball a few times).

State de/serialization
----------------------

First of all, a widget that wants to use the state history feature, needs to implement the serialization 
and deserialization of it's internal state.  Let's extend the widget ``BallPlayer`` from the :ref:`original example <ballgame_code>`.

.. code:: javascript

    class BallPlayer2 extends BallPlayer {
        ...
        // define state serialization
        stateToPar() {
            let par = +this.has_ball // boolean to int
            this.log(-1, "stateToPar", par)
            return par.toString() 
        }
        // validate a serialized state
        validatePar(par) {
            // return false if par can't parsed as an integer value
            let i = parseInt(par)
            if (isNaN(i)) { // not an integer
                this.err("validatePar failed with par",par,":",i,"not a number")
                return false
            }
            if (i!=0 && i!=1) {
                this.err("validatePar failed with :",i,"not 0 or 1")
                return false
            }
            return true;
        }
        // define state deserialization
        parToState(par) {
            this.has_ball = (parseInt(par) == 1) // int to bool
            this.log(-1, "parToState", this.has_ball)
            this.setBall()
        }
        ...
    }

``stateToPar`` defines how the internal state of the widget is encoded into a string, so
that it can appear in the browser's URL field in the form of ``par=value``.

``parToState`` defines the inverse operation: how we can set the internal
state of the widget using the text ``par=value`` from the browser's URL field.

``validatePar`` returns ``true`` or ``false``, depending if the provided parameter
can be deserialized into a state or not.

All widgets that want the state management feature, must also define
a signal named ``state_change``:

.. code:: javascript

    createSignals() {
        super.createSignals()
        this.signals.state_change = new Signal() // required for state management
    }

They must also define meticulously *when* the state should be serialized and saved,
by calling ``stateSave``:

.. code:: javascript

    catch_ball_slot() { // receive a ball
        super.catch_ball_slot()
        this.stateSave()
    }
    createState() {
        super.createState()
        this.stateSave()
        // initialize to not having a ball
    }
    throwBall() {
        if (!this.has_ball) {
            // we don't have the ball..
            return
        }
        this.has_ball = false
        this.setBall()
        this.stateSave()
        this.signals.throw_ball.emit()
    }


Using state de/serialization
----------------------------

Let's modify the original :ref:`ballgame example <ballgame>` to include state history handling:

.. code:: javascript

    import { BallPlayer2, BillBoard2 } from './ballplayer2.js';
    import { StateManager } from './statemanager.js'

    class MyStateManager extends StateManager {
        validateInitialState() { // how to form the initial state
            if ((this.cache.alex == null) || 
                (this.cache.bob == null) ||
                (this.cache.billboard == null)) {
                    this.cache.alex = '0'
                    this.cache.bob = '1'
                    this.cache.billboard = '0'
                }
        }
    }

    var alex = new BallPlayer2("alex");
    var bob = new BallPlayer2("bob");
    var billboard = new BillBoard2("billboard")
    var state = new MyStateManager("state")

    alex.setLogLevel(-1)
    bob.setLogLevel(-1)
    billboard.setLogLevel(-1)
    state.setLogLevel(-1)

    // connect alex, bob and billboard's state_change signal
    // to state's state_change_slot
    state.register(alex, bob, billboard);

    // ball from alex to bob
    alex.signals.throw_ball.connect(
        bob.catch_ball_slot.bind(bob)
    )
    // ball from bob to alex
    bob.signals.throw_ball.connect(
        alex.catch_ball_slot.bind(alex)
    )
    // inform billboard about the game
    // alex throws
    alex.signals.throw_ball.connect(
        billboard.ball_throw_slot.bind(billboard)
    )
    // bob throws
    bob.signals.throw_ball.connect(
        billboard.ball_throw_slot.bind(billboard)
    )

    // NOTE: order of the following calls (1, 2) is important
    // as you want to update the state information _before_ it is saved
    // into the url address bar
    state.connectStateChanges() // (1)

    // when the URL address serialize state is updated:
    billboard.signals.state_change.connect( // (2)
        state.state_save_slot.bind(state)
    )

Let's dissect what is exactly happening here.

Serialize
---------

*(a) Caching the state*

Each time a ballplayer changes it's state (throws or catches a ball), it sends the signal ``state_change``, carrying a key-value pair 
to the ``MyStateManager`` widget .  ``MyStateManager`` then caches these key value pairs.

A default behaviour is that always when a widget changes it's state, the information is sent to ``MyStateManager``.  This is enabled by:

.. code:: javascript

    state.connectStateChanges() // (1)

That line of code connects all widgets' ``state_change`` signals to ``MyStateManager`` 's ``state_change_slot`` (you could connect them separately by yourself as well).

Say, if the ball has been thrown 5 times and is currently with alex, then the cached key-values within ``MyStateManager`` would look like this:

.. code:: text

    alex: 1
    bob: 0
    billboard: 5

*(b) Updating the URL address bar*

When the ``state.save_state_slot`` is fired, ``MyStateManager`` proceeds to update the URL address bar and insert the new address into the
browser's history, with this trailing address:

.. code:: text

    ?alex=1&bob=0&billboard=5

Note that the **(a) caching of the deserialized state** into ``MyStateManager`` is separated from the **(b) URL and history update**.  When and if
the latter happens is defined by connecting signals to ``MyStateManager``'s  ``save_state_slot``.

When the new deserialized state appears in the browser's URL address and history, is another matter completely and is defined by these lines (2):

.. code:: javascript

    // when the URL address serialize state is updated:
    billboard.signals.state_change.connect( // (2)
        state.state_save_slot.bind(state)
    )

Had we connected signals from all widgets (ballplayers and the billboard) to ``state_save_slot``, we would create three states into browser's history each time a ball is thrown - a thing
we obviously do not want.

One final note: the order of calling (1) and (2) is important: we want the slots to be called in such an order that the states are cached first and
only after the caching is complete, the state is updated into the browser URL address bar and history.

Deserialize
-----------

Deserialization, i.e. the widgets setting their state, based on what appers in the URL address field ``?alex=1&bob=0&billboard=5``
ending of the URL, is triggered always when you press the forward/backward buttons of the browser.

``MyStateManager`` will pick up the parameters from the URL address field and calls each widget's ``parToState`` method.

Initialization
--------------

We also have to define what happens at the initial page load.  In the current case, if a single state parameter is missing, we will just reset all of them:

.. code:: javascript

    class MyStateManager extends StateManager {
            validateInitialState() { // how to form the initial state
                if ((this.cache.alex == null) || 
                    (this.cache.bob == null) ||
                    (this.cache.billboard == null)) {
                        this.cache.alex = '0'
                        this.cache.bob = '1'
                        this.cache.billboard = '0'
                    }
            }
        }

A more default behaviour would be:

.. code:: javascript

    class MyStateManager extends StateManager {
            validateInitialState() { // how to form the initial state
                if ((this.cache.alex == null) || 
                    (this.cache.bob == null) ||
                    (this.cache.billboard == null)) {
                        this.setDefaultValues()
                    }
            }
        }

Where ``MyStateManager`` simply asks from each widget for a suitable initial parameter by calling ``setDefaultValues()``.

Pitfalls
--------

``parToState`` is fired always when a serialized state is pulled from the browser history, so you probably **don't want 
signals and widget interactions fired when** ``parToState`` **is called:** this would make one widget to alter the state of another
widget (via the signal-slot connections), while we actually want them just to create a state from the deserialized data.

So be carefull not to fire any signals originating in/directly from ``parToState``.

