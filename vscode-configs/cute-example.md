---
description: Create the CuteFront example app (industrial quality control frontend)
---
NOTE TO CLAUDE: before building anything, read the whole specification below and then tell the user, very briefly:

1. What you are about to build (a couple of sentences).
2. Why this app is tricky, for example: two instances of the same widget class with different roles,
   two-way selection sync between the height profiles and the list (beware of signal loops),
   and sample statuses that arrive asynchronously later and must update the right list item (and profile view).
3. The plan: first the individual widgets, each with its test html file, and finally the landing page with all the wiring.

Then ask the user if you should proceed.  Don't create any files before the user says so.

---

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
Use the standard parameters `testing=true&test-panel=true&network-testing=true` (see `TestingUrlManager` in `lib/base/testingutils.js`),
so that VSCode's "Cutefront HTML file DEBUG" launch configuration opens the SPA in test-mode.
In test-mode, there should be an additional panel with buttons for "send new sample", "polish latest sample", i.e. buttons for simulating all core functions.

Please do the initial testing of the test htmls and the SPA using the "cute-browser" command.

Here is the layout for the SPA:

[first height profile ]   [ status widget ]

[second height profile]   [ list of height profs ]

---

NOTE TO CLAUDE: once the app is ready and tested, tell the user how to try it out in VSCode:

1. Open `app/landing.html` (or any of the widget test html files)
2. Click "Run and Debug" in the left-hand-side vertical menu
3. From the dropdown menu at the top of the "Run and Debug" panel, choose either:
   - "Cutefront HTML file": opens the page as such
   - "Cutefront HTML file DEBUG": opens the page in test-mode, i.e. with the test panel for simulating the production line
4. Press the green "play" button (or F5).  Google Chrome opens the page, attached to VSCode's debugger,
   so the user can set breakpoints in the js files, etc.

Also encourage the user to try both a maximized browser window and smaller window sizes (and Chrome's "device toolbar"
in the developer panel for phone-sized screens), to see how the layout adapts.
