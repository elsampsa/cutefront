
.. _chatgpt:

AI Generated Widgets
====================

You can use your favorite Large Languages Models (LLMs) to generate CuteFront widgets and associated html files.

The idea is, that *you* work out the logic of your applications: the required widgets, their signals and slots and
how signals and slots should be connected between widgets.

After that, you use your favorite AI assistant to generate the widget's javascript and html code, with exact instructions
of what you want.

LLMs, such as ChatGPT, have seen most (if not all) of this world's javascript, css and html during their training.  
Furthermore, CuteFront widgets are clean, logical and relatively short entities, so we can expect LLMs to perform well in their generation.

However, before starting to request ready-made widgets from your LLM of choice, you need to explain it a bit what CuteFront
is all about with a *preconditioning prompt*.

You can find the up-to-date prompt from `here <https://github.com/elsampsa/cutefront/blob/main/prompt.md>`_

After feeding the preconditiong prompt, ChatGPT says something like this:

*Got it! I understand the structure and the process of creating widgets in CuteFront. 
Whenever you're ready to request a new widget, just let me know, 
and I'll be happy to assist you in creating the corresponding .js and .html files.*

And it is ready for your service.

Try, for example:

.. code-block:: text

    Please give me a widget that implements a (bootstrap) card.  The card shows a person's name and surname in editable text fields.  
    The widget should have separate slots for changing the name and surname by signals.  
    The card should have a button "save".  When "save" is clicked, the widget should send a signal with the current name and surname.

i.e. define what the widget should do, how it should look like and it's signals and slots.

For simple widgets, ChatGPT usually nails it at the first attempt.

You can also create the :ref:`widget "manually" by yourself <creating>` (tip: use the template-copying script ``create.bash`` in your ``app/`` directory),
and then ask for your LLM assistant to create the most elaborous part of the widget, i.e. the :ref:`createElement <createelement>` method for you:

.. code-block:: text

    Please create me only the createElement() method of a widget.
    It should create a bootstrap card that shows a person's name and surname as editable text fields.
    Their DOM elements should be attached to member variables "name_field" and "surname_field", respectively.
    The card should have a button "save".  When "save" is clicked, the widget should send a signal "changed" with the current name and surname.
    
.. note:: 

    Note how we are avoiding the creation of extra member state variables (this.name, this.surname), 
    and just use the html field values as member state variables instead.

