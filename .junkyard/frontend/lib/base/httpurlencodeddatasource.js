import { HTTPDataSource } from './httpdatasource.js';

class HTTPURLEncodedDataSource extends HTTPDataSource { /*//DOC
    HTTP DataSource that sends data as application/x-www-form-urlencoded
    All CRUD operations use URL-encoded body format
    Subclass of HTTPDataSource - inherits auth, error handling, and helper methods
    */
    
    async read() { /*//DOC
        READ operation - typically GET requests don't need URL encoding
        Override if your API requires URL-encoded params for GET
        */
        const ENDPOINT = '/data';
        const VERB = 'GET';
        return await this.makeRequest(ENDPOINT, {
            method: VERB
        });
    }
    
    async create(datum) { /*//DOC
        CREATE with URL-encoded body
        */
        const ENDPOINT = '/data';
        const VERB = 'POST';
        const urlEncoded = this._jsonToURLEncoded(datum);
        return await this.makeRequest(ENDPOINT, {
            method: VERB,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncoded.toString()
        });
    }
    
    async update(datum) { /*//DOC
        UPDATE with URL-encoded body and ID in URL path
        */
        const ENDPOINT = '/data';
        const VERB = 'PUT';
        const id_key = this.uuid_key;
        const urlEncoded = this._jsonToURLEncoded(datum);
        return await this.makeRequest(`${ENDPOINT}/${datum[id_key]}`, {
            method: VERB,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncoded.toString()
        });
    }
    
    async delete(id) { /*//DOC
        DELETE - typically doesn't need URL encoding
        Override if your API requires URL-encoded body for DELETE
        */
        const ENDPOINT = '/data';
        const VERB = 'DELETE';
        return await this.makeRequest(`${ENDPOINT}/${id}`, {
            method: VERB
        });
    }

    async create_alt(datum) { /*//DOC
        Example alternative CREATE with all params in URL query string
        Shows how to construct GET/POST with query parameters instead of body
        Some APIs use this pattern: POST /data?name=John&email=john@example.com
        */
        const ENDPOINT = '/data';
        const VERB = 'POST';
        const urlEncoded = this._jsonToURLEncoded(datum);
        return await this.makeRequest(`${ENDPOINT}?${urlEncoded.toString()}`, {
            method: VERB
        });
    }

    async read_alt(params) { /*//DOC
        Example alternative READ with params in URL query string
        Shows how to pass filter/search parameters: GET /data?status=active&type=user
        :param params: Object with query parameters
        */
        const ENDPOINT = '/data';
        const VERB = 'GET';
        const urlEncoded = this._jsonToURLEncoded(params);
        return await this.makeRequest(`${ENDPOINT}?${urlEncoded.toString()}`, {
            method: VERB
        });
    }
}

export { HTTPURLEncodedDataSource };
