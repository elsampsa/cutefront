
.. _install:

Starting a Project
==================

Here we assume that you are using either Cursor or VSCode with AI agents.

Emphasis here is on VSCode + Claude Code running in the VSCode extension.

From scratch
------------

Wanna play around, maybe just do a frontend-only app and not worry about backends, databases, proxies for the moment?

Let's create a minimal scaffold.

Create a directory for your project and enter it:

.. code-block:: bash

    mkdir my_cute_app
    cd my_cute_app

and use this silly initialization script: TODO: UPDATE

.. code-block:: bash

    bash <(curl -sSL https://raw.githubusercontent.com/elsampsa/cutefront/main/script/project_init.bash)

Let's use ``app`` as the app subdirectory name.

Now you have the necessary directory structure and the widget base library: 

.. code-block:: text

    my_cute_app
    ├── app                    # your app's .js and .html files
    ├── app.html               # your frontend entry-point
    ├── assets                 # images, etc.
    ├── css                    # your app's css
    ├── lib
    │    ├── base
    │    ├── bootstrap
    │    |       ├── css  
    │    |       └── js
    │    ├── cutetools           # python package program 
    │    ├── get_bootstrap.bash
    │    ├── include             # bootstrap icons, fontawesome, some extra js libraries
    │    ├── render              # widgets based on those extra js libraries
    │    ├── static              # images, etc.
    │    └── train               # training material for AI
    │            └── CLAUDE.md   # context for Claude
    ├── .vscode
    │    ├── launch.json         # debug your cutefront widgets with vscode
    │    └── tasks.json          
    │
    └── .claude
            └── commands
                    └── cutefront.md        
                                # use shorthand command "/cutefront" in claude code 
                                # to give context about cutefront
                        current-project.md  
                                # TODO: by you
                                # use shorthand command "/current-project" 
                                # in claude code to give context on your current project


FastAPI Fullstack
-----------------

Check out the grand FastAPI fullstack example:

.. code-block:: bash

    git checkout https://github.com/elsampsa/fullstack-fastapi-cutefront
    git submodule update --init --recursive

Now you have:

- The original (pristine) FastAPI fullstack example as a submodule
- Cutefront frontend has been built on top of the fullstack example
- Custom docker compose files run the original fullstack example with Cutefront frontend

.. code-block:: text

    ├── cutefront/     # cutefront frontend as a git submodule
    │                  # has all the lib,.vscode,.claude 
    │                  # directories as in the "From Scratch" example above
    └── full-stack-fastapi-template/
                      # the original fullstack fastapi example
                      # as a submodule
    docker-compose.dev.yml
    docker-compose.staging.yml
    ...
    README.md         # read for more details!

This is a ready-to-run all-included fullstack app.

