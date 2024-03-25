
.. _install:

Starting a Project
==================

A. With Project Init Script
---------------------------

Here we create a minimal scaffold for a new project.

Create a directory for your project and enter it:

.. code-block:: bash

    mkdir my_cute_app
    cd my_cute_app

.. code-block:: bash

    bash <(curl -sSL https://raw.githubusercontent.com/elsampsa/cutefront/main/script/project_init.bash)

Let's use ``app`` as the app subdirectory name.

Now you have the necessary directory structure and the widget base library (for more details, see :ref:`code organization <codeorg>`):

.. code-block:: text

    my_cute_app
    ├── app                    # your app's .js and .html files
    ├── app.html               # your frontend entry-point
    ├── assets                 # images, etc.
    ├── css                    # your app's css
    └── lib                    # *** The CuteFront Widget Library ***
         ├── base              # ***    AS A GIT SUBMODULE        ***
         └── bootstrap-5.2.3-dist   
            ├── css
            └── js


B. With Fullstack Example
-------------------------

Here we will checkout the whole `CuteFront main repo <https://github.com/elsampsa/cutefront>`_,
that includes the complete :ref:`Fullstack Example <fullstack>`, with python backend, dockerization, etc.

The idea is, that you can then remove the parts you don't need.

.. _install-fullstack:

Get the code with either of these:

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


Next, we will checkout the widget library.

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

You can see the commit and branch of your current library with:

.. code:: bash

    git submodule status

When in directory ``frontend/lib``, all git commands work on the library (sub)repository instead, i.e. please try therein ``git config --get remote.origin.url``.

Finally, depending on your particular case, you might or might not want to use the widget library as git submodule, 
but just download a zipfile from github and extract it into ``frontend/lib/``

Nginx, sqlite, etc.
-------------------

For the :ref:`native development mode <native>` you need additionally to install 
sqlite3 and nginx:

.. code:: bash

    sudo apt-get install sqlite3 nginx


Firefox
-------

Firefox and it's web developer tools are highly recommended.  Please see also the :ref:`Plainfile <plainfile>` development environment.

