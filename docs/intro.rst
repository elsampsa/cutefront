

.. _intro:

Intro
=====

*CuteFront is the lightweight, quick and modular javascript frontend framework*

Features
--------

CuteFront is a semi-declarative javascript frontend framework, featuring:

- Code structured into clearly separated components (widgets) that communicate through signals and slots
- No node, npm or transpiling.  Code runs only in the browser.  
- No annoying templating languages, just pure javascript and html
- Minimal package mainteinance: CuteFront is just html and javascript running in the browser, so it just "is"
- Qt's touch'n'feel with widgets, signals and slots
- Simple development environment with plain .js and .html files
- Global state partitioned and cached into widgets - avoid global state mess
- AI Widget generation using Large Language Models (LLMs) :ref:`works like a dream <chatgpt>`

If you are a "learning-by-doing" person, want to skip the chit-chat and take a quick look what CuteFront is about,
I recommend that you take the ~ 30 minutes :ref:`tutorial <tutorial>`.

Here is a a quick look at a typical CuteFront main html file using widgets:

.. code:: html

    <!doctype html>
    <head>
    <meta charset="utf-8">
    <link href="../bootstrap-5.2.3-dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <div id="alex"></div>
    <div id="bob"></div>

    </body>
    <script src="../bootstrap-5.2.3-dist/js/bootstrap.bundle.min.js"></script>

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
- Sure, there is Flutter and Dart that are also programmatic and widget-based approaches, but here we use only browser-native javascript!
- Very ideal for people who have `Qt <https://doc.qt.io/qt-6/qtwidgets-index.html>`_ or `GTK <https://www.gtk.org/>`_, i.e. widget based GUI development background
- Even more so for people with `PyQt <https://riverbankcomputing.com/software/pyqt>`_ / `PySide2 <https://wiki.qt.io/Qt_for_Python>`_ background

For What?
---------

- To get an interactive web-page quickly up and running
- Especially for smaller projects requiring complex reactive frontend code, SPA (single-page applications) and the like
- Not guaranteed or tested for huge projects, although the system is component-based and *requires no transpiling* (eliminating one big problem for large projects)

Cute-What?
----------

.. image:: images/qt.svg.png
   :scale: 20%

*Qt and Qt logo are registered trademarks of the Qt company*

As I have nothing to do with the Qt company, this project is called CuteFront
