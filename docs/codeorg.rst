 
Code Organization
=================

*Where to put your stuff?*

Whether it is for development or deployment, use this:

.. code-block:: text

    .
    ├── app                    # your app's .js and .html files
    ├── app.html / index.html  # your frontend entry-point
    ├── assets                 # images, etc.
    ├── bootstrap-5.2.3-dist   # downloaded bootstrap js and css
    │  ├── css
    │  └── js
    ├── css                    # your app's css
    ├── docker                 # special stuff installed in docker image
    │  └── dev
    │      └── nginx.conf
    ├── Dockerfile.dev         # docker image file
    ├── lib                    # *** The CuteFront Widget Bibrary ***
    │  └── base
    └── test.html              # some basic test entry-point

You can find this scheme in the ``frontend`` directory of the :ref:`repo <install>`.  It's also
used by the :ref:`fullstack example <fullstack>`.
