



```
Main html

    - Creates object instances
    - Create signal/slot connections (see ## below) 
    - Calls DataSource.read_slot()

    - CardWidget & FormWidget adapt to the Datamodel
    - ListWidget is insensitive to the Datamodel
    - ListItemWidget must be subclassed for each Datamodel

    ListWidget
        // Shows a list of datums
        // A single datum can be (un)chosen
        STATE:
            - ListItemWidget(s)
            - Reference to active ListItemWidget

        UP:
            - signals.current_datum // carries complete datum (with uuid)
                // of currently chosen element.  null = nothing chosen
                ## connect to CardWidget.current_datum_slot
                ## connect to FormWidget.current_datum_slot
                ## connect to CrudButtonsWidget.current_datum_slot

        IN: 
            - datums_slot // input: array of all datums
                - Recreate all ListItemWidget(s)
                - Set all ListItemWidget(s) to deactivated
                - Activate one of them if there was a chosen ListWidget item & uuids match (by calling activate_slot)
            - activate_slot
                - For all items, call ListItemWidget.deactivate_slot
                - For one item, call ListItemWidget.activate_slot
                - signals.current_datum.emit

        ListItemWidget (internal)
            // Data and html code corresponding to a single datum
            // if chosen, highlighted
            STATE:
                - cached datum
            UP: signals.clicked // carries uuid of activated item
                ## connect to parent ListWidget.activate_slot
            IN: 
                - deactivate_slot 
                - activate_slot
            getters:
                - getDatum() // returns cached datum
        ListItemWidget
            ...
        ListItemWidget
            ...
        ...

    CardWidget
        // Shows detailed / all data of a datum
        STATE: cached datum
        IN: 
            - datamodel_slot // tells cardwidget to which datamodel to adapt
            - current_datum_slot // input: complete datum (or null)

    FormWidget
        // A dialog that can be used to create or update datums
        STATE: 
            - cached datum data in html form fields
            - cached uuid of the datum.  uuid == null means "create" mode
        UP:
            - signals.create // carries new datum
                ## connect to DataSource.create_slot
            - signals.update // carries updated datum (with uuid)
                ## connect to DataSource.update_slot
        IN: 
            - datamodel_slot // tell form widget to which datamodel to adapt
            - create_slot // open the popup in "create" mode (check uuid == null)
            - update_slot // open the popup in "update" mode (check uuid != null)
            - current_datum_slot // input: complete datum (or null)
                - alters the state by setting data into the html form fields
                - null input clears the fields

    DataSource
        // Handles all CRUD operations with the backend
        UP: signals.data // carries array of datums
            ## connect to ListWidget.datums_slot
        IN:
            - create_slot // input: a new datum (without uuid)
            - read_slot // tell data source to refresh itself.  no input
            - update_slot // input: updated datum (with uuid)
            - delete_slot // input: datum uuid
        // NOTE: all slots do signals.datums.emit

    CrudButtonsWidget
        // A group of buttons: "new", "update", "delete"
        STATE: visilibity of the buttons: delete & update are deactivated if current_datum_slot got null
        UP:
            - signals.create
                ## connect to FormWidget.create_slot
            - signals.update
                ## connect to FormWidget.update_slot
            - signals.delete
                ## connect to DataSource.delete_slot

        IN: current_datum_slot // input: currently chosen datum (or null)

```

