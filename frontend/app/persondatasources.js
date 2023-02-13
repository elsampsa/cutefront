
// this file has been autogenerated with "newfrontdata.py"
// which you can find in your backend's "api_v1/" directory
//
// command used was:
// ./newfrontdata.py Person
//
// TODO: you might need to correct the relative directory of "../base/lib"

import { DataSourceWidget } from '../lib/base/datasourcewidget.js';
import { HTTPDataSourceWidget } from '../lib/base/httpdatasourcewidget.js';

class PersonMockDataSourceWidget extends DataSourceWidget {
    createState() {

        // Incoming mock data from backend
        this.data = [
            {
                name : '1',
                surname : '1',
                email : '1',
                age : 1,
                address : '1',
                uuid : '1',
            },
        ]; // this.data

        // Schema for create operations: your input forms need this
        this.datamodel_create = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_create

        // Schema for read operations: what is expected from the server
        // There can be more data elements not described in here (like uuid)
        // but they should be checked/displayed in downstream widgets (i.e. they're hidden)

        // Should be consistent with your mock data
        this.datamodel_read = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_read

        // Schema for update operations into the server
        // uuid is always assumed, so it is not listed in here
        this.datamodel_update = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_update

    }; // createState
}; // mockdatasource


// this file has been autogenerated with "newfrontdata.py"
// which you can find in your backend's "api_v1/" directory
// command used was:
// ./newfrontdata.py Person

class PersonHTTPDataSourceWidget extends HTTPDataSourceWidget {
    declareDatamodels() {

        // Schema for create operations: your input forms need this
        this.datamodel_create = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_create

        // Schema for read operations: data expected from server
        // There can be more data elements not described in here (like uuid)
        // but they should be checked/displayed in downstream widgets (i.e. they're hidden)
        this.datamodel_read = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_read

        // Schema for update operations into the server
        // uuid is always assumed, so it is not listed in here
        this.datamodel_update = {

                name : {
                        label : 'Name',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                surname : {
                        label : 'Surname',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                email : {
                        label : 'Email',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },

                age : {
                        label : 'Age',
                        help  : 'todo',
                        check : this.checkInt.bind(this)
                    },

                address : {
                        label : 'Address',
                        help  : 'todo',
                        check : this.checkStr.bind(this)
                    },
        }; // this.datamodel_update

    }; // declareDataModels
}; // httpdatasource

export { PersonMockDataSourceWidget, PersonHTTPDataSourceWidget };

// import with:
// import { PersonMockDataSourceWidget, PersonHTTPDataSourceWidget } from './app/persondatasources.js';

// use like this:
/*
// var data_source = new PersonMockDataSourceWidget() // for developing with mock data
var data_source = new PersonHTTPDataSourceWidget({ // for the real-deal
    base_address: "http://0.0.0.0:8080", // for local dev session without webserver
    // base_address: "", // when using webservers
    api_slug: "api_v1",
    object_name: "person"
    // authenticator: authenticator // TODO
})
*/
