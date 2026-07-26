REST Endpoints
==============

The basics: DataSource and DataSourceWidget
--------------------------------------------

Before schemas or validation enter the picture, every CuteFront backend connection boils down to
just two pieces:

- A **DataSource** subclass that knows how to talk to the backend (or, for a **MockDataSource**,
  how to fake it).
- A **DataSourceWidget** subclass that turns the DataSource's async calls into slots, and their
  results into signals, so the rest of your widget graph never has to deal with promises directly.

The example below (``backendexample.js`` and ``backendexample.html``, found in the base widget
library repo under ``train/``) defines three operations - a ``GET``, a ``POST`` with a JSON body,
and a ``POST`` with ``multipart/form-data`` - with no ``DataModel`` involved at all.

**The datasource** subclasses ``HTTPDataSource`` (real backend) and ``MockDataSource`` (in-memory
fake, handy for UI work before a backend even exists). Both expose the same method names and
return shape, which is what lets you develop against the mock and swap in the real
``HTTPDataSource`` later without touching anything downstream:

.. code:: javascript

    class ExampleHTTPDataSource extends HTTPDataSource {
        async getSome() {
            const requestConfig = this._buildRequestConfig('example/some', { method: 'GET' });
            return await this._makeRequest(requestConfig);
        }

        async postSome(datum) {
            const requestConfig = this._buildRequestConfig('example/some', {
                method: 'POST',
                body: JSON.stringify(datum)
            });
            return await this._makeRequest(requestConfig);
        }

        async postFormData(datum) {
            const formData = this._jsonToFormData(datum);
            return await this.makeFormRequest('example/some-form', 'POST', formData);
        }
    }

    class ExampleMockDataSource extends MockDataSource {
        constructor() {
            super();
            this.data = { message: "Hello from the mock backend!" };
        }

        getSome() {
            return this._simulateNetwork(async () => structuredClone(this.data));
        }

        postSome(datum) {
            return this._simulateNetwork(async () => {
                if (datum && datum.fail) {
                    // lets you exercise the error path on demand, without a real backend
                    throw { message: "HTTP 400: Bad Request", status: 400,
                            body: { detail: "fail flag was set in datum" } };
                }
                return { message: `Server got: ${JSON.stringify(datum)}` };
            });
        }
        // postFormData() follows the same _simulateNetwork() pattern as postSome()
    }

**The widget** subclasses ``DataSourceWidget``, turning each dataSource call into a slot and each
result into a signal:

.. code:: javascript

    class ExampleDataSourceWidget extends DataSourceWidget {
        createSignals() {
            super.createSignals(); // keep DataSourceWidget's own error/loading_* signals
            this.signals.someData = new Signal("Result of getSome(). Carries: { message: str }");
            this.signals.success = new Signal("Fired after ANY operation succeeds. Carries nothing.");
        }

        get_some_slot() {
            this.signals.loading_start.emit('get-some');
            this.dataSource.getSome()
                .then((reply_message) => {
                    this.signals.loading_success.emit('get-some');
                    this.signals.success.emit();
                    this.signals.someData.emit(reply_message);
                })
                .catch((error) => {
                    this.signals.loading_error.emit({operation: 'get-some', error: error});
                    this._emitError("Get failed", error); // emits the inherited signals.error
                });
        }
        // post_some_slot() / post_form_data_slot() follow the same then/catch pattern
    }

``_emitError()`` and the ``error`` / ``loading_*`` signals come for free from ``DataSourceWidget`` -
see the header comment in ``train/backendexample.js`` for the full rundown of what the base
``DataSource``, ``HTTPDataSource`` and ``DataSourceWidget`` classes already give you.

**Wiring it up** in html is pure signal/slot connection - no ``async``/``await`` in sight:

.. code:: javascript

    var mockDataSource = new ExampleMockDataSource();
    var dataSourceWidget = new ExampleDataSourceWidget("datasource-widget", mockDataSource);
    var controlWidget = new ExampleControlWidget("controls"); // renders the buttons, emits a signal per click
    var statusWidget = new ExampleStatusWidget("status");     // shows the result in green, errors in red

    controlWidget.signals.get_some.connect(() => dataSourceWidget.get_some_slot());
    dataSourceWidget.signals.someData.connect((data) => statusWidget.data_slot(data));
    dataSourceWidget.signals.error.connect((error) => statusWidget.error_slot(error));

Click a button, and the chain runs itself: **click -> signal -> slot -> dataSource promise resolves
-> signal -> slot** updates the DOM. Nothing in between ever awaits anything by hand.

Open ``backendexample.html`` directly in a browser (with ``--allow-file-access-from-files`` if
loading straight from disk) to try it interactively - it defaults to the mock datasource, so it
works with no backend at all.

Datamodels and sources
----------------------

Once you need schema validation and adaptive forms on top of the pattern above, ``DataModel``
enters the picture. Cutefront comes with all the necessary machinery to communicate with your REST API endpoint.

- ``datamodel.js`` : ``DataModel`` defines the structure of the data records.  
- ``datasource.js`` : ``DataSource`` defines CRUD operations.
- ``httpdatasource.js`` : ``HTTPDataSource`` : HTTP implementation of the ``DataSource``
- ``datasourcewidget.js`` : ``DataSourceWidget`` coordinates UI interaction and signals and slots of a datasource
- ``authmodel.js`` : ``AuthModel`` is an authentication model for httpdatasource (injects auth data into the request, say, a token)

For your particular data backend, you would typically:

- Subclass the ``DataModel`` to define the schemas for CRUD operations (lets call the subclass ``ItemDataModel``).  This *defines what kind of json structure you expect from your REST backend*.
- Subclass ``HTTPDataSource`` (let's call it ``ItemHTTPDataSource``) here you *define how you talk to the backend*, i.e. ``GET``, ``POST`` and all that for all CRUD operations.  You can also define any arbitrary call - and define what to expect from the backend.
- Subclass ``DataSourceWidget`` (say, to ``ItemDataSourceWidget``): this is the widget level object which *defines the signals and slots* i.e. interaction of the data flow with the rest of the CuteFront framework

So the pattern is: *DataSourceWidget uses HTTPDataSource uses DataModel*, i.e. we are relying here heavily on the *delegate pattern* and separation of concerns for each component to
get maximum flexibility.

In practice the API looks like this:

.. code:: javascript

    const itemDataSource = new ItemHTTPDataSource()
        .setBaseUrl(baseUrl)
        .setDataModel(new ItemDataModel())
        .setUUIDKey("id")
        .setPaginationStrategy(new FapiPaginationStrategy())
        .setAuthModel(authModel)

    const itemDataSourceWidget = new ItemDataSourceWidget('item-datasource-widget', itemDataSource);

This permits us to change datasources to dummy sources (i.e. REST backend simulation), let the datasource handle with composite and delegate patterns things such
as authentication, pagination strategy, etc.

Adaptive forms
--------------

The ``DataSource`` and ``DataSourceWidget`` classes are written in such a way that they support adaptive data structures and input data forms instead of hard-coded ones 
(however, you are free to use hard-coded forms if you feel like it).

``DataSourceWidget`` uses the CRUD definitions from ``DataSource``, where you have defined for example:

.. code:: javascript

    // Schema for create operations
    this.create = {
        title: new FreeStringFormField("Title", "Title of the item"),
        description: new TextAreaFormField("Description", "Description of the item", {rows: 4})
    };

``DataSourceWidget`` features ``datamodel_create`` signal that propagates this information downstream to slots of other widgets that can then use this information
to adapt themselves to the datamodel.  The ``FormWidget`` class of the base widget library features adaptive forms.

For more details, please see the fullstack FastAPI example.
