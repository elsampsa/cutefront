
.. _install:

Starting a Project
==================

Here we assume that you are using either Cursor or VSCode with AI agents.

Emphasis here is on VSCode + Claude Code running in the VSCode extension.

From scratch
------------

Wanna play around, maybe just do a frontend-only app and not worry about backends, databases, etc?

Let's create a minimal scaffold.

Create a directory for your project and enter it:

.. code-block:: bash

    mkdir my_cute_app
    cd my_cute_app

and use this online initialization script:

.. code-block:: bash

    bash <(curl -sSL https://raw.githubusercontent.com/elsampsa/cutefront/main/new_project.bash)

Now you have the necessary directory structure and the widget base library: 

.. code-block:: text

    my_cute_app
    ├── app/                   # TODO: put here your app's .js and .html files
    │    ├── lib/              # library for your app-specific widgets
    │    ├── static/           # app static assets
    |    └── landing.html      # your frontend's entry-point
    │
    ├── lib                    # cutefront base widget library as a git submodule
    │    ├── base
    │    ├── bootstrap
    │    |       ├── css  
    │    |       └── js
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
                    └── cute-frontend.md
                                # use shorthand command "/cute-frontend" in claude code 
                                # to give context about cutefront
                        current-project.md
                                # TODO: by you
                                # use shorthand command "/current-project" 
                                # in claude code to give context on your current project


Next, lets establish ``my_cute_app`` as the root directory of you vscode project and use Claude Code's vscode extension and give it the command ``/cute-frontend``.
We're ready to go.

Now we can test how Claude Code and Cutefront perform in creating a webapp with some potential for global state mess.  Try for example this prompt:

    Hi! Let's create a single-page application: a frontend for an industrial visual quality control system.

    There are three widget classes:

    -  A widget showing the status of the production line (statuses of conveyor belt, robotic arm and the polishing blade)
    -  A 2D height profile (colormap) widget of a sheet of some Very Expensive Sample Material
    -  A list widget of past, inspected height profiles.  Each list item includes timestamp and a sample status (polished or not)

    Here is some more information on the widget instances and interactions:

    - There are two instances of the height profile widget
    - The first height profile is always updated to the latest data received from the production line
    - The second height profile corresponds to the sample user has clicked in the list of past height profiles.  By default it is the latest sample from production line
    - When user clicks on a height profile (either first or second one), the corresponding list item is chosen in the list
    - When user clicks on a list item, the second height profile shows the corresponding height profile
    - Each list item / sheet of Very Expensive Material has a sample status (polished or not) that is updated some time in the future
      (when the blade has polished the sample succesfully)

    As always with cutefront, for each widget class, please create corresponding test html files.  Each test file should include
    buttons for testing and one button that says "test all" which performs all unit tests on that widget.

    No backends at this stage, but lets create mock datasources to simulate the actual backend.
    The SPA application should go into "landing.html" and it should have a test-mode that can be invoked with URL-encoded parameters.
    In test-mode, there should be an additional panel with buttons for "send new sample", "polish latest sample", i.e. buttons for simulating all core functions.

    Please do the initial testing of the test htmls and the SPA using the "cute-browser" command.

    Here is the layout for the SPA:

    [first height profile ]   [ status widget ]

    [second height profile]   [ list of height profs ]

.. tip:: 

    If you want get philosophical, ask Claude Code why Cutefront doesn't need a "Virtual DOM" :)

.. _fastapi:

FastAPI Fullstack
-----------------

Check out the `FastAPI fullstack example <https://github.com/elsampsa/fullstack-fastapi-cutefront>`_:

.. code-block:: bash

    git checkout https://github.com/elsampsa/fullstack-fastapi-cutefront
    git submodule update --init --recursive

Now you have:

- The original (pristine & untouched) FastAPI fullstack example as a submodule
- Cutefront frontend has been built on top of the fullstack example
- Custom docker compose files run the original fullstack example with Cutefront frontend

.. code-block:: text

    ├── cutefront/     # cutefront frontend as a git submodule
    │                  # has all the lib,.vscode,.claude 
    │                  # directories as in the "From Scratch" example above
    └── full-stack-fastapi-template/
                      # the original fullstack fastapi example
                      # as a submodule with vite frontend etc.
    docker-compose.dev.yml
    docker-compose.staging.yml
    ...
    README.md         # read for more details!
    create-scaffold.sh
                      # create a project stub

This is a ready-to-run all-included fullstack app.  It is also the SOTA reference on Cutefront and FastAPI-based fullstack apps.

You can use the ``create-scaffold.bash`` script to create a stand-alone project stub without the original vite-frontend and submodular structures.





