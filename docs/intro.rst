

.. _intro:

Intro
=====

*Program in frontend Javascript like you were doing PyQt*

Features
--------

CuteFront is a frontend framework, featuring:

- Code structured into clearly separated components / widgets that intercom through signals and slots
- No npm package mess or transpiling
- No templating languages, just pure js and html
- Qt's touch'n'feel with widgets, signals and slots
- Simple development environment with plain js and html files
- Global state partitioned and cached into widgets
- The signal/slot paradigm creates possibilities for graphical representation of page interactions (like in qt studio).

A code example:

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

- Ideal for people who have `Qt <https://doc.qt.io/qt-6/qtwidgets-index.html>`_ or `GTK <https://www.gtk.org/>`_, i.e. widget based GUI development background
- Even more so for people with `PyQt <https://riverbankcomputing.com/software/pyqt>`_ / `PySide2 <https://wiki.qt.io/Qt_for_Python>`_ background
- For people who are, like me, deeply frustrated with the bloated modern-day javascript frameworks

For What?
---------

- To get an interactive web-page quickly up and running
- Especially for smaller projects requiring complex reactive frontend code, SPA (single-page applications) and the like
- Not guaranteed or tested for huge projects, although the system is component-based and *requires no transpiling* 
(eliminating a problem for big projects)
- CuteFront is in poc (proof-of-concept) stage, and expanding the widget library requires *your* help

Cute-What?
----------

.. image:: images/qt.svg.png
   :scale: 20%

*Qt and Qt logo are registered trademarks of the Qt company*

As I have nothing to do with the Qt company, this project is called CuteFront
