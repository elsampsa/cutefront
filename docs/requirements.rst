
.. _started:

Getting started
===============

Explain here, what you need to do in order to get the module up and running

.. let's do cross-referencing

Let's refer to :ref:`the introduction <intro>`.


System requirements
-------------------

.. list here architecture-specific and python-version-specific requirements

Use Linux and Mac if you have to, but never Windows.



Required packages
-----------------

Install the following packages on a debian-based distribution:

::

    sudo apt-get install some-package


Start also the following system service
      
::

    sudo service some-service start


Developers
----------

.. tip for developers: you can copy paste this section and send it to a new team member

Set up your environment (you might have these directories already):

::

    cd
    mkdir python3
    mkdir python3_packages


Include python3 into your PYTHONPATH (include this one into your .bashrc)

::

    export PYTHONPATH=$HOME/python3
  

Install this package with:

::

    cd ~/python3_packages
    git clone https://[your-personal-git-repository]/your_package_name
    cd your_package_name
    ln -s $PWD/your_package_name $HOME/python3

Or substitute the last line with

::

    pip3 install --user -e .
  
The effect is the same - creating a link that allows python to find your package (in the latter case that link is the *$HOME/.local/lib/python3.x/site-packages/skeleton.egg-link* file)
  
.. if you have set up your own git repo, the command looks typically like this:
.. git clone git@$YOUR_SERVER:your_package_name.git
  

List of additional required :download:`[packages]<snippets/requirements.txt>`:

.. include:: snippets/requirements.txt_
               
.. developer, always test your packages in virtualenv, like this:
.. virtualenv --no-site-packages -p python3 test
.. cd test
.. source bin/activate
.. pip3 install git+ETC

.. _production:
        

Production
----------

.. attention: production versions should always come with a version tag

Install the package with:

::

  pip3 install --upgrade git+git://[your-personal-git-repository]/your_package_name@version_tag

.. some other possible commands:
.. pip3 install --upgrade git+ssh://user@[your-personal-git-repository]/your_package_name@version_tag


Test the package
----------------
  
Once you've installed this package (either for development or for production), test the installation with (use either ipython or ipython3)

::

  ipython3
  from your_package_name.greeters import FancyHelloWorld
  gr=FancyHelloWorld(person="Sampsa",age=40)
  print(gr)
    

