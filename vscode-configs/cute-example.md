Let's create a single-page application: a frontend for an industrial visual quality control system.

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
