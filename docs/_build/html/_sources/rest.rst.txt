REST Endpoints
==============

Datamodels and sources
----------------------

Cutefront comes with all the necessary machinery to communicate with your REST API endpoint.

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
