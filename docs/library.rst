 
.. _library:

Widget Library
==============

Basic Widgets
-------------

Please take a look into ``frontend/lib/base``.  Some important files therein:

- ``widget.js`` : the motherclass of all widgets
- ``example.js`` : an example on widget subclassing
- ``example.html`` : html file corresponding to ``example.js``
- ``create.bash`` : a shorthand bash script for creating a new widget from template

Rest of the files are widgets used by the :ref:`fullstack example <fullstack>` 
for CRUD operations.

Note also that:

- Each widget component lives in its own ``.js`` file
- Each widget component has an accompanying ``.html`` file for minimal interactive testing and demonstration of the widget

You can test each of the widgets by simply accessing their test/demo html files.  However, before that, you need to set up at least the
*Plainfile* development environment.  See :ref:`here <plainfile>` for more details.

Contribute
----------

When you get into :ref:`developing widgets <creating>`, please share them!  This project
needs your contribution.

The widget library organization is still an open question.  However, they should
be vaguely organized in subdirectories according to common categories / authors.

An accompanying html file (see above) is required for all contributed widgets.







