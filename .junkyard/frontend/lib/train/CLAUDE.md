## Synopsis

Hi Claude!

Let's do some development with CuteFront.  It is a pure-javascript and HTML framework.  It is similar to the Qt desktop framework.  

This file is either a preamble of a small dump of the CuteFront library I have given you or alternatively you get this file independently and then you can decide which parts of the library you want to study in more detail.

Let's summarize how CuteFront works.

Widgets are written in javascript.  CSS and HTML from bootstrap version 5 are used.

A Widget creates it's corresponding HTML code to the DOM with javascript.

Widgets emit signals.

Widgets have slots for receiving signals from other widgets.

Code for each widget resides in a separate .js file.  We want to use some strict naming conventions:

- A widget class named "SomeWidget" or "Some" would live in a file "some.js".
- An instance of "SomeWidget" should have the name "someWidget".

Each widget has a corresponding html file with the same name (example: "some.html") for basic testing.  These testing files
should be very basic html without any "eye candy" or fancy css styling.  The idea is that the user can see easily how the widgets are used
from html.

The idea is, that widgets have their own, well-separated and documented API and they only interact with the outside world using signals and slots.

When user interacts with a widget (say, with a click or typing something), the widget's **internal state is changed** (say, contents of a text field or a radio button state).  This interaction can result in a signal being emitted.

When a widget receives a signal to a slot, this typically results in its internal state (and its HTML) being changed.

The state of the widget is cached in widget's HTML elements (say, the state of a radio button).  This is the preferred
way to maintain the state.  If needed, some part of the state can also be cached to internal member variables (say, `this.some_boolean_flag`, etc.).

When creating single-page applications with complex interactions between widgets, the signals and slots between widgets instances are explicitly connected in the main html file.

## Gold-standard example widget

Now I will give you an example how to define a basic widget class `HateLike`.

The implementation is in file `hatelike.js` and it's accompanying html file in `hatelike.html`.  `hatelike.js` is a brief "gold" standard
example widget, with the latest ideas in widget organization and API declaration.

You MUST read at least these two files:

./hatelike.js
./hatelike.html

Please READ THEM NOW.

Next, let's take a look at some widgets in the base library.  Remember that CuteFront is still a work in progress and some of the files
might not have all the correct docstrings, etc. but we want to get there.

Said that, these are widget classes in the base library you should take a look at:

```bash
../base/group.js
../base/formwidget.js
../base/listwidget.js
../base/sidebarwidget.js
../base/tabwidget.js
```
(and the corresponding html files).

## Testing Widgets

Each test html file can be run in chrome with the `--allow-file-access-from-files` parameter to visualize an individual widget.

More complex single-page applications (SPAs) can also be opened in the same way: the page has internal logic so that it goes into debug state
when opened as a file.  In the debug state it typically uses mock datasources, adds testing panels, etc.
          
_You_ can use this too: there is a custom tool named "cute-browser" where you get "hands and eyes" on the web-page and browsing!  Please try this for more info:
```bash
cute-browser --help
```
For local testing, you should use the `--local` flag that allows local js file access.

You can remove additional testing panels by defining these URL-encoded parameters when opening the SPA html file:
```
network-testing=false
test-panel=false
```

I, for my part, can use the "device toolbar" feature in the chrome's developer panel.  However, in order for us to get consistent results, it is important that the html files have this one defined:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Subwidgets and subobjects

Widgets can have subwidgets (i.e. widgets enclosed in a "mother" widget), and subwidgets their own subwidgets, etc. in a hierarchical manner.

Subwidgets that can/should be accessed by the API user are grouped under the `widgets` namespace, i.e. in a `GroupWidget` instance you could access them like this:
`groupWidget.widgets.tabWidget1` and then deeper into the hierarchy like this: `groupWidget.widgets.tabWidget1.widgets.someOtherSubwidgetInstance`, etc.

Here are all subobjects/functions the user can access, grouped under their corresponding namespaces:

- subwidgets under the `widgets` namespace
- all methods ending with the name `_slot`
- signals under the `signals` namespace
- Input fields under the `input_fields` namespace

There are also subobjects/widgets not supposed to be accessed by the API user.

Take for example the ListWidget that owns ListItemWidget(s).  ListWidget creates child widgets on-the-fly and caches them into a list.  It can then query the ListItemWidget(s) HTML DOM element from their ``getElement()`` and attach it to it's own DOM tree / remove it from it's own DOM tree when necessary.  For more details, take a look into `../base/listwidget.js`.

For an example on how to compose a page of complex nested widgets, please take a look into `./landing.html` and `./layout.html`.  

The complex hierarchy of a widget can be visualized with the `cute-get-api-tree` tool (which you might want to use).

For example, in `./landing.html` we have this line:
```html
window.genDocs = ["container", "itemDataSourceWidget","userDataSourceWidget","authUserFloaterWidget"]
```
Now we can do this:
```bash
cute-get-api-tree landing.html
```
It takes the widget instances named "container", "itemDataSourceWidget", etc., dumps their API (signals, slots, subwidgets, etc.) into a hierarchical yaml file into the stdout.

## Forms and fields

When creating forms for user input data, we have several options:

- Create the form from scratch as an independent widget
- Create the form from scratch, but use ready-made `FormField` classes from `../base/formfield.js`
- Define data structures and necessary `FormField` classes in the `DataModel` class (see below) for adaptable input forms

To make testing easier, each `FormField` has `fillValid()` and `fillInvalid()` methods to fill them with valid or invalid data.
These can then be used by the composite/mother widgets to fill individual fields automatically for testing purposes.

Composite widgets should have slot `set_debug_slot()`.  Calling this slot will set the widget into a debug state that renders two extra
buttons "fillValid" and "fillInvalid" that are used to fill in the form with in/valid data.

More complex testing panels can be implemented in the main html file itself.

## Backend data

How data is received from the backend and inserted to the widgets, is handled by datasource widgets.  Please keep an eye on these files:
```
../base/datamodel.js : `DataModel` defines the structure of the data records.  
../base/datasource.js : `DataSource` defines CRUD operations.
../base/httpdatasource.js : `HTTPDataSource` : HTTP implementation of the datasource
../base/datasourcewidget.js : `DataSourceWidget` coordinates UI interaction and signals and slots of a datasource
../base/authmodel.js : `AuthModel` is an authentication model for httpdatasource (injects auth data into the request, say, a token)
```

```js
const itemDataModel = new ItemDataModel(); // defines what datarecords have .. subclassed from DataModel
const itemDataSource = new MockDataSource().setDataModel(itemDataModel).setUUIDKey("id"); // 
const itemDataSourceWidget = new DataSourceWidget('item-datasource-widget', itemDataSource);
```
`HTTPDataSource` class has these methods:
```js
setBaseUrl(url)
setAuthModel(authModel) 
setPaginationStrategy(strategy) 
```
What we typically do, is to the create mock data sources that imitate the actual datasources and then finally switch from the mock
to the actual (http(s)) datasource.

## State Management

Widgets can serialize their state to the browser's URL address bar, enabling:

- Bookmarkable/shareable URLs with widget state
- Browser back/forward navigation between states

### Widget Serialization API

Widgets wanting to participate in state serialization must:

1. Define the `state_change` signal:
```js
createSignals() {
    this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
}
```

2. Configure serialization in the HTML file (chainable API):
```js
myWidget.setSerializationKey("mykey")   // URL parameter name
        .setSerializationWrite(true);    // true = create history entries, false = only update URL
```

3. Override these methods in the widget class:
```js
getSerializationValue() { // return serialized state as a string
    return this.someValue.toString();
}
setState(serializationValue) { // deserialize and apply state (validate first!)
    const val = parseInt(serializationValue);
    if (!isNaN(val)) {
        this.someValue = val;
    }
}
```

4. Call `this.serialize()` whenever the widget's state changes and should be saved:
```js
this.button.onclick = () => {
    this.someValue++;
    this.serialize(); // emits state_change signal
};
```

### StateWidget

`StateWidget` manages URL state for all registered widgets:

```js
const stateWidget = new StateWidget();
stateWidget.register(widget1, widget2, widget3); // registers and connects automatically
```

The `register()` method:
- Reads each widget's `serializationKey` via `getState()`
- Connects each widget's `state_change` signal to StateWidget's `change_state_slot`
- Pulls existing state from URL and applies to widgets via `setState()`
- Sets up browser back/forward button handling

When a widget calls `serialize()`:
- If `serializationWrite` is true: creates new browser history entry (`push()`)
- If `serializationWrite` is false: just caches the serialization value, but doesn't create a new entry into browser history

On browser back/forward: StateWidget calls each widget's `setState()` with the restored value.

See `../base/statewidget.html` for a working example.

## Timing-Independent Slots (Slot Timing Independence)

When implementing slots that depend on other asynchronous operations, use a timing-independent pattern to avoid race conditions.

### Problem

Consider a widget that needs two things to happen before it can perform an action:
1. `activate_debug_slot()` is called (user requests debug mode)
2. `datamodel_slot(schema)` is called (data arrives from backend)

These can happen in **any order** because they're asynchronous. If debug activation depends on the datamodel existing, it may fail if called first.

### Solution Pattern

Decouple the operations using flags and a shared helper method:

```js
createState() {
    this.datamodel = null;
    this.debug_mode_activated = false; // Flag: has activate_debug_slot been called?
    this.debug_buttons_added = false;  // Flag: are debug features in the DOM?
}

activate_debug_slot() {
    // Set the flag that debug mode has been requested
    this.debug_mode_activated = true;

    // If datamodel already exists, set up features now
    if (this.datamodel != null) {
        this._setupDebugFeatures();
    }
    // Otherwise, wait for datamodel_slot to call it
}

datamodel_slot(datamodel) {
    this.datamodel = datamodel;
    // ... create form fields ...

    // Check if debug mode should be activated now that we have a datamodel
    if (this.debug_mode_activated) {
        this._setupDebugFeatures();
    }
}

_setupDebugFeatures() {
    if (this.debug_buttons_added) return; // Idempotency guard

    // Actually add debug buttons and activate features
    // ...

    this.debug_buttons_added = true;
}
```

### Key Principles

1. **Intent flags** (`debug_mode_activated`): Track what has been *requested*
2. **State flags** (`debug_buttons_added`): Track what has been *completed*
3. **Condition checks**: Each slot checks if conditions are met
4. **Shared helper**: Both slots call the same helper method when conditions are satisfied
5. **Idempotency guard**: Helper returns early if already executed

This pattern works **regardless of call order**:
- If `activate_debug_slot()` → `datamodel_slot()`: Helper called from `datamodel_slot()`
- If `datamodel_slot()` → `activate_debug_slot()`: Helper called from `activate_debug_slot()`

See `../base/formwidget.js` for a real implementation.

## Conclusions

I hope you got it!

If I ask for new widgets, please always provide me with both the .js and accompanying .html files.

I know you're excited, but please do not provide any files if I don't ask for it explicitly.  :)

I might also ask you to take a look at the web-page rendering.  All test html files can be rendered in file mode


Thank you!
