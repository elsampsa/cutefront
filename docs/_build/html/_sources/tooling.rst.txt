Tooling
=======

Python tools
------------

First, please install the Cutefront python tools package:

.. code:: bash

    cd cutetools
    pip install -e .

API Tree
--------

Each widget inherits from the base ``Widget`` class and thus comes with 
functions to create dynamical autodocumentation.  Namely, each widget comes with method
``getAPITree()`` that inspects the namespaces mentioned in :ref:`Subwidgets section <subwidgets>`.

This way we can build up a deep nested tree structure of the whole widget hierarchy.

First, you need to define in your html the top level widgets for the hierarchy.  Suppose you have 
widget instances ``yourWidget1`` and ``yourWidget2`` you wish to use, then add this to your main html:

.. code:: javascript

    window.genDocs = ["yourWidget1", "yourWidget2"]

And run:

.. code:: bash

    cute-get-api-tree your.html

This will produce file ``api-docs.yaml`` with the complete widget hierarchy structure and namespaces of your SPA.

You can browse ``api-docs.yaml`` in VSCode, but first remember to collapse the levels with ``Ctrl-0`` to get
full benefit of the hierarchical organization.

It gets better if you install our vscode-plugin from directory ``vscode-plugins/cutefront-vscode-plugin/``:
now you will have an interactive API Tree in your VSCode.  By clicking items in the tree, it takes you
to the place where they were defined in your codebase.

TODO: check the apiDocsPath variable (is it needed anymore)?

For more details, please see the fullstack FastAPI example.

AI Browser automation
---------------------

You can tell your AI buddy to test the html it created for you by all itself, by using this command (that comes with our python tools):

.. code:: bash

    cute-browser

If you want to use something more advanced, give VSCode's claude extension superhuman browser power via an MCP server.

Do this from your command line (emphasis on that ``--scope user``):

.. code:: bash

    claude mcp add --scope user browser -- npx @agent-infra/mcp-server-browser@latest
    claude mcp add --scope user browser -- npx @browsermcp/mcp@latest

The second mcp server is taylor-made for 
`this extension <https://chromewebstore.google.com/detail/bjfgambnhccakkhmkepdoekmckoijdlc?utm_source=item-share-cb>`_

Now you can tell your ai buddy (claude code vscode extension) to test whatever html for you.

Javascript Navigation
---------------------

To make the object-oriented JS navigation better, please take a look into ``vscode-plugins/js-class-navigator/``.

Its a (work-in-progress) VSCode plugin that helps you navigate object-oriented JS code.
