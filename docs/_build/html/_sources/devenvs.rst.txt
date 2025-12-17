 
Development Environments
========================

.. _devenvs:

Please see that the provided ``launch.json`` is in your project's ``.vscode`` directory.

1. Dev Tier-1 aka "Plainfile"
-----------------------------

*Develop and debug individual Cutefront components in your VSCode IDE*

The whole philosophy of Cutefront are easily-debuggable individual components.  So let's do just that.

- Choose a Cutefront HTML file in your VSCode
- Go into VSCode debugging tab
- Choose ``Cutefront HTML file://`` from the "Run and Debug" dropdown menu

You can try this first with any of the library widgets - try it for example with ``ballplayer.html``.

VSCode opens you google-chrome in a separate window.  It is attached into your debug session, so you can
follow code execution on-spot and live, set breakpoints, execute the JS code step-by-step, capture signals, etc.

.. note::

    Your debugging target must always be the .html file NOT the .js file

.. warning::

    Don't wander into the internet or anywhere else with the debug session chrome

.. tip::

    Remember to reinit google-chrome's cache by right-clicking the reload button or by disabling
    caching in the developer tools

In this "DEV Tier-1" mode you can also debug, not only individual widgets, but a complete fullstack app as well.
As there is typically no backend in this development mode, you must use mock datasources that imitate the backend.
For more on this subject, please refer to the actual code in the :ref:`FastAPI fullstack example <install>`.

2. Dev Tier-2
-------------

*Develop and debug Cutefront fullstack apps in your VSCode IDE*

In order to try this, you need to run the :ref:`FastAPI fullstack example <install>` and start it in the development mode.

- Go into VSCode debugging tab
- Choose `Cutefront FastAPI landing` from the dropdown menu

Now:

- All your frontend code is still in your local directory and filesystem
- JS and HTML is served by a development server, handled by VSCode
- Backend is running in docker compose, exposing a local port and serving frontend

3. Staging Tier-3
-----------------

*Test your production-ready and packaged Cutefront fullstack app*

In order to try this, you need to run the :ref:`FastAPI fullstack example <install>` and start it in the staging mode.

- Your frontend is packaged (gzipped) and served by nginx from a docker container






