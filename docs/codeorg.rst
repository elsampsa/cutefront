
.. _codeorg:

Code Organization
=================

*Where to put your stuff?*

Whether it is for development or deployment, use this very same schema you got after
:ref:`installing <install>` the example code:

.. code-block:: text

    .
    ├── app                    # your app's .js and .html files
    ├── app.html / index.html  # your frontend entry-point
    ├── assets                 # images, etc.
    ├── css                    # your app's css
    ├── docker                 # special stuff installed in docker image
    │  └── dev
    │      └── nginx.conf
    ├── Dockerfile.dev         # docker image file
    ├── lib                    # *** The CuteFront Widget Library ***
    │    ├── base              # ***    AS A GIT SUBMODULE        ***
    │    └── bootstrap-5.2.3-dist   
    │       ├── css
    │       └── js
    └── test.html              # some basic test entry-point

This schema is also used by the :ref:`fullstack example <fullstack>`.

