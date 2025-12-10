 
.. _library:

Widget Library
==============

By now, you have checked out or downloaded the widget library
as was instructed in :ref:`here <get_library>` from 
`github <https://github.com/elsampsa/cutefront-lib>`_.

Basic Widgets
-------------

Please take a look into ``frontend/lib/base``.  Some fundamental files therein:

- ``widget.js`` : the motherclass of all widgets
- ``example.js`` : an example on widget subclassing
- ``example.html`` : html file corresponding to ``example.js``

Note that:

- Each widget component lives in its own ``.js`` file
- Each widget component has an accompanying ``.html`` file for minimal interactive testing and demonstration of the widget

You can test each of the widgets by simply accessing their test/demo html files.

TODO: mention the plainfile

.. warning::

    There is no guarantee that all the widgets and their corresponding html file are up-to-date
    In this respect, I am working towards an automatized CI/CD system
