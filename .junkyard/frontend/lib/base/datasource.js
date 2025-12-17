import { DataModel } from "./datamodel.js";

class DataSource { /*//DOC
    DataSource may or may not use DataModel (from ./datamodel.js)
    */
    constructor() {
        this.dataModel = null;
        this.paginationInfo = null;
        this.paginationStrategy = null;
        this.uuid_key = 'uuid'; // what column is used as the unique identifier
        this.timeout = 30000; // default timeout: 30 seconds (in milliseconds)
        this.networkSimulator = null;
    }

    // Abstract methods - subclasses must implement
    read() {
        throw new Error("read() must be implemented by subclass");
    }

    create(datum) {
        throw new Error("create() must be implemented by subclass");
    }

    update(datum) {
        throw new Error("update() must be implemented by subclass");
    }

    delete(id) {
        throw new Error("delete() must be implemented by subclass");
    }

    setPage(paginationInfo) {
        throw new Error("setPage() must be implemented by subclass");
    }

    setDataModel(dataModel) {
        this.dataModel = dataModel;
        return this;
    }

    setPaginationStrategy(strategy) {
        this.paginationStrategy = strategy;
        return this;
    }

    setUUIDKey(key) {
        this.uuid_key = key;
        return this;
    }

    getUUIDKey() {
        return this.uuid_key;
    }

    setTimeout(ms) { /*//DOC
        Sets the timeout for all datasource operations.
        :param ms: Timeout in milliseconds (e.g., 10000 for 10 seconds)
        :returns: this (for method chaining)
        */
        this.timeout = ms;
        return this;
    }

    setNetworkSimulator(simulator) { /*//DOC
        Sets a network simulator for testing purposes.
        :param simulator: NetworkSimulator instance (or null to disable)
        :returns: this (for method chaining)
        */
        this.networkSimulator = simulator;
        return this;
    }
}


class MockDataSource extends DataSource { /*//DOC
    A datasource for list like data: each element of the list is a json object
    Features pagination
    */
    constructor() {
        super();
        this.data = [];
    }

    setDataModel(dataModel) {
        this.dataModel = dataModel;
        this.data = this.dataModel.getMockData(15);
        return this;
    }

    async _simulateNetwork(operation) { /*//DOC
        Helper method to apply network simulation to any async operation.
        Implements timeout simulation for mock datasources.
        :param operation: Async function to execute
        :returns: Result of the operation
        :throws: Error if operation times out
        */
        // Create a timeout promise that rejects after this.timeout ms
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject({
                    message: `Request timed out after ${this.timeout}ms`,
                    status: 408,  // HTTP 408 Request Timeout
                    body: { detail: 'Request timeout' }
                });
            }, this.timeout);
        });

        const mockFetchFn = async () => {
            // Mock data sources don't actually use fetch, but we wrap the operation
            // in a Promise-like structure that the simulator can work with
            const result = await operation();
            // Return a Response-like object for error simulators
            return new Response(JSON.stringify(result), {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' }
            });
        };

        // Race between the operation and the timeout
        if (this.networkSimulator) {
            const response = await Promise.race([
                this.networkSimulator.execute(mockFetchFn),
                timeoutPromise
            ]);

            // Check for HTTP errors (like HTTPDataSource does)
            if (!response.ok) {
                const errorBody = await response.json();
                throw {
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                    body: errorBody
                };
            }

            // Parse the response back to data
            return await response.json();
        }

        return await Promise.race([
            operation(),
            timeoutPromise
        ]);
    }

    read() {
        return this._simulateNetwork(async () => {
            if (this.paginationStrategy && this.paginationStrategy.enabled) {
                if (this.paginationStrategy.currentPage < this.paginationStrategy.baseIndex) {
                    console.error("wrong pagination base index")
                }
                else {
                    this.paginationStrategy.totalItems = this.data.length;
                    const start =
                        (this.paginationStrategy.currentPage - this.paginationStrategy.baseIndex) *
                        (this.paginationStrategy.pageSize);
                    const end = start + Math.min(this.paginationStrategy.pageSize, this.paginationStrategy.totalItems);
                    console.log(this.data.slice(start, end));
                    return this.data.slice(start, end);
                }
            }
            return this.data;
        });
    }

    create(datum) {
        return this._simulateNetwork(async () => {
            // Simple validation
            if (!datum || typeof datum !== "object") {
                throw {
                    message: "Invalid datum provided",
                    status: null,
                    body: null
                };
            }

            const id = this.uuid_key

            // Generate ID
            const maxId = Math.max(
                0,
                ...this.data.map((item) => parseInt(item[id]) || 0)
            );
            const newDatum = {
                ...datum,
                [id]: String(maxId + 1),
            };

            this.data.push(newDatum);
            return newDatum;
        });
    }

    update(datum) {
        return this._simulateNetwork(async () => {
            const id_key = this.uuid_key;

            if (!datum || !datum[id_key]) {
                throw {
                    message: `Missing ${id_key} for update`,
                    status: null,
                    body: null
                };
            }

            const index = this.data.findIndex((item) => item[id_key] === datum[id_key]);
            if (index === -1) {
                throw {
                    message: `Item with ${id_key} ${datum[id_key]} not found`,
                    status: null,
                    body: null
                };
            }

            this.data[index] = { ...this.data[index], ...datum };
            return this.data[index];
        });
    }

    delete(id) {
        return this._simulateNetwork(async () => {
            const id_key = this.uuid_key;
            const index = this.data.findIndex((item) => item[id_key] === id);
            if (index === -1) {
                throw {
                    message: `Item with ${id_key} ${id} not found`,
                    status: null,
                    body: null
                };
            }

            const deleted = this.data.splice(index, 1)[0];
            return deleted;
        });
    }

    setPage(paginationInfo) { /*//DOC
        Originates typically from upstream widgets to set the current page and page size
        (and then followed by an immediate call to read)
        paginationInfo = {
            currentPage: int,
            pageSize: int, 
            ...
        }
        paginationInfo = null disables pagination
        */
        if (this.paginationStrategy) {
            this.paginationStrategy.set(paginationInfo)
        }
    }
}

export { DataSource, MockDataSource };
