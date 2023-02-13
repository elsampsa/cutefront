
.. _install:

Installing
==========

Download the Repo
-----------------

Get the code (for example) with:

.. code:: bash

    git clone TODO

You'll get this directory structure:

.. code-block:: text

    .
    ├── backend/                # A FastAPI backend for the fullstack example
    ├── bash/                   # Some helper scripts
    ├── docker-compose-dev.yml  # Fullstack example docker-compose file
    ├── docs/                   # This documentation
    ├── frontend/               # CuteFront frontend
    └── secrets/                # .ini files for the fullstack example


Install Bootstrap 5
-------------------

You need to download bootstrap 5 into directory ``frontend``:

.. code:: bash

    cd frontend
    ./get_bootstrap.bash
    cd ..


Nginx, sqlite, etc.
-------------------

For the :ref:`native development mode <native>` you need additionally to install 
sqlite3 and nginx:

.. code:: bash

    sudo apt-get install sqlite3 nginx


Firefox
-------

Firefox and it's web developer tools are highly recommended.  Please see also the :ref:`Plainfile <plainfile>` development environment.


