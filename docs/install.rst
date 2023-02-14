
.. _install:

Installing
==========

Download the Repo
-----------------

Get the code (for example) with either of these:

.. code:: bash

    git clone https://github.com/elsampsa/cutefront.git
    git clone git@github.com:elsampsa/cutefront.git

You'll get this directory structure:

.. code-block:: text

    .
    ├── backend/                # A FastAPI backend for the fullstack example
    ├── bash/                   # Some helper scripts
    ├── docker-compose-dev.yml  # Fullstack example docker-compose file
    ├── docs/                   # This documentation
    ├── frontend/               # CuteFront frontend
    |      |
    |      └── lib/             # The widget library from https://github.com/elsampsa/cutefront-lib
    |                           # (see below)
    └── secrets/                # .ini files for the fullstack example


Checkout The Widget Library
---------------------------

.. _get_library:

The widget library is available at `<https://github.com/elsampsa/cutefront-lib>`_.

.. git submodule add git@github.com:elsampsa/cutefront-lib.git lib
By default, the widget library is installed as a separate `git submodule <https://gist.github.com/gitaarik/8735255>`_.  This 
makes it possible to use different versions and branches of the widget library in your project (see more in :ref:`here <codeorg>`)

The only thing you need to do is this (in the main repo's directory):

.. code:: bash

    git submodule init
    git submodule update

And congrats, you now have the widget library in ``frontend/lib/``.

However, depending on your particular case, you might or might not want to use the widget library as git submodule, but just download a zipfile from github and extract it
into ``frontend/lib/``


Nginx, sqlite, etc.
-------------------

For the :ref:`native development mode <native>` you need additionally to install 
sqlite3 and nginx:

.. code:: bash

    sudo apt-get install sqlite3 nginx


Firefox
-------

Firefox and it's web developer tools are highly recommended.  Please see also the :ref:`Plainfile <plainfile>` development environment.


