 
Development Environments
========================

.. _plainfile:

1. Plainfile
------------

In this development you open your app's entry point 
(``app.html`` or ``index.html``) directly with your browser from the disk.

You would do the same for the html files in the ``frontend/lib/base`` directory, when
developing and debugging a new widget.

In firefox, type this into your browser's address bar:

.. code-block:: text

    file://abs/path/to/file.html

(abs typically has one more extra ``/``, i.e. the final url would look like ``file:///home/user/etc``).

Enable web developer tools in Firefox from the menu bar:

.. code-block:: text

    Tools -> Browser Tools -> Web Developer Tools

And you have yourself a first class in-browser development / debugging environment.  On code
changes you simply need to refresh the browser view.

In order to be able to follow links in your ``app.html``, 
you still need to give firefox a full file access and create a separate development 
profile for that.  Start firefox with:

.. code:: bash

    firefox -ProfileManager

Therein, create a separate profile for firefox, called "development" and use that profile.

Within then development profile, type into your firefox's address field:

.. code-block:: text

    about:config

Search for ``fileuri`` & set the property

.. code-block:: text

    security.fileuri.strict_origin_policy

to ``false``.

You can start firefox in that profile with

.. code-block:: text

    firefox -P development

**WARNING** : the ``security.fileuri.strict_origin_policy`` allows firefox to 
**read any file on your filesystem** so be carefull not to browse in the
web using the "development" profile!

You might also prefer a more sophisticated way of isolation, say "firejail" or the like.

At this stage of the development (developing individual widgets and putting initially
together your fullstack app), you would typically use a mock datasouce
(for more details, see datasources in :ref:`here <fullstack>`)

2. Native
---------

In this mode, a reverse-proxy server (nginx) is serving you the html and js files.

When using this development mode, you'd already have a backend you want to play with.

A single-shot python wrapper for nginx is provided in directory ``frontend/``, please
start it with

.. code:: bash

    ./nginx.py --help

to see the options.  

Refer to the :ref:`Fullstack Example <fullstack>` to see an actual working example.

3. Docker
---------

A docker image file ``frontend/Dockerfile.dev`` is provided.  It simply runs nginx with
the provided ``nginx.conf`` from ``frontend/docker/dev/`` directory.

All code in ``frontend/`` is mounted into a docker volume, allowing you to edit and
"hot reload" the code live in ``frontend/``.

Refer to the :ref:`Fullstack Example <fullstack>` to see an actual working example.

