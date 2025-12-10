

.. _intro:

Intro
=====

*CuteFront is a lightweight, quick and modular javascript frontend framework*

Features
--------

CuteFront is a semi-declarative javascript frontend framework, featuring:

- Code structured into clearly separated components (widgets) that communicate through signals and slots
- No node, npm or transpiling.  Code runs only in the browser.  
- No annoying templating languages, just pure javascript and html
- Minimal package mainteinance: CuteFront is just html and javascript running in the browser, so it just "is"
- Qt's touch'n'feel with widgets, signals and slots
- Global state partitioned and cached into widgets - avoid global state mess

Here is a a quick look at a typical CuteFront main html file using widgets:

.. code:: html

    <!doctype html>
    <head>
    <meta charset="utf-8">
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <div id="alex"></div>
    <div id="bob"></div>

    </body>
    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>

    <script type="module">

    import { BallPlayer } from './ballplayer.js';
    var alex = new BallPlayer("alex");
    var bob = new BallPlayer("bob");
    // connect a signal from alex to bob
    alex.signals.throw_ball.connect(
        bob.catch_ball_slot.bind(bob)
    )
    // connect a signal from bob to alex
    bob.signals.throw_ball.connect(
        alex.catch_ball_slot.bind(alex)
    )
    // give ball initially to alex
    alex.catch_ball_slot()

    </script>


For Whom?
---------

- For people who are, like me, deeply frustrated with the bloated modern-day javascript frameworks
- Ideal for people who have `Qt <https://doc.qt.io/qt-6/qtwidgets-index.html>`_ or `GTK <https://www.gtk.org/>`_, i.e. widget based GUI development background

For What?
---------

- To get an interactive web-page quickly up and running
- Ideal for complex projects requiring reactive frontend code, SPA (single-page applications)
- Both for frontend-only and fullstack apps

Cute-What?
----------

.. image:: images/qt.svg.png
   :scale: 20%

*Qt and Qt logo are registered trademarks of the Qt company*

I have nothing to do with the Qt company - and this project is called *Cute*Front
