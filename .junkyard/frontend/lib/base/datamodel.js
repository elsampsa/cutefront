/*
DataModel defines the structure and validation for data records used in CRUD operations.

DataModels contain instantiated FormField objects that encapsulate validation logic.

Example:

import { FreeStringFormField, IntegerFormField, EmailFormField } from './formfield.js';

class UserDataModel extends DataModel {
    constructor() {
        super();
        this.create = {
            name: new FreeStringFormField("First Name", "The first name of the person"),
            surname: new FreeStringFormField("Last Name", "The surname of the person"),
            email: new EmailFormField("Email", "The email address"),
            age: new IntegerFormField("Age", "Age in years")
        };
        this.read = this.create;
        this.update = this.create;
    }

    getMockData(n) {
        return [
            {uuid: "1", name: "John", surname: "Doe", email: "john@example.com", age: 30},
            {uuid: "2", name: "Jane", surname: "Smith", email: "jane@example.com", age: 25}
        ];
    }
}
*/

import { FreeStringFormField, IntegerFormField, EmailFormField } from './formfield.js';

class DataModel { /*//DOC
    Base class for defining data models used in CRUD operations.

    Subclasses should define:
    - this.create: FormField instances for create operation
    - this.read: FormField instances for read operation (often same as create)
    - this.update: FormField instances for update operation (often same as create)
    - getMockData(n): returns mock data for testing

    DataModels use instantiated FormField objects that encapsulate both
    field rendering and validation logic.
    */
    constructor() {
        // Example datamodel - subclasses should override this
        this.create = {
            name: new FreeStringFormField("First Name", "The first name of the person"),
            surname: new FreeStringFormField("Last Name", "The surname of the person"),
            email: new EmailFormField("Email", "The email address"),
            age: new IntegerFormField("Age", "Age in years")
        };
        this.read = this.create;
        this.update = this.create;
    }

    getMockData(n) { /*//DOC
        Returns a list of mock data records.

        Arguments:
        n - Number of records to return (can be ignored by implementation)

        Returns:
        Array of data records, or empty array if no mock data available.

        Subclasses should override this method.
        */
        return [];
    }
}

export { DataModel }
