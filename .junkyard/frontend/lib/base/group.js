import { Widget, Signal } from './widget.js';

class Group extends Widget { /*//DOC
    Groups other widgets into group.  
    Only one widget from the group is shown at a time.  
    Other ones are hidden
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
    }
    getSerializationValue() {
        /* state is encoded using widget names, e.g. "home.settings"
        for all visible elements, separated by "."
        */
        const visibleNames = [];
        for (const [name, widget] of Object.entries(this.widgets)) {
            if (widget.isVisible()) {
                visibleNames.push(name);
            }
        }
        const s = visibleNames.join(".");
        this.log(-1, "getSerializationValue", s);
        return s;
    }
    setState(serializationValue) {
        this.log(-1, "setState", serializationValue);
        if (typeof serializationValue !== "string") {
            return;
        }
        // hide all
        for (const item of this.itemList) {
            item.setVisible(false);
        }
        // pick up which ones to show by name
        if (serializationValue.length === 0) {
            return;
        }
        const names = serializationValue.split(".");
        for (const name of names) {
            if (this.widgets.hasOwnProperty(name)) {
                this.widgets[name].setVisible(true);
            }
        }
    }
    createState() {
        this.itemList = [];
        this.visible = true;
        this.listen_hash = true;
    }
    createElement() {
    }
    hide_all_slot() { /*//DOC Hide all widgets in this group*/
        for (const item of this.itemList) {
            item.setVisible(false);
        }
        this.serialize();
    }
    show_all_slot() { /*//DOC Show all widgets in this group*/
        for (const item of this.itemList) {
            item.setVisible(true);
        }
        this.serialize();
    }
    show_slot(item) { /*//DOC
        Hide all other widgets, show widget item
        */
        if (this.itemList.includes(item)) {
            for (const item_ of this.itemList) {
               if (item_ == item) {
                    item_.setVisible(true);
               }
               else {
                    item_.setVisible(false);
               }
            }
            // item.setVisible(true);
        }
        this.serialize();
    }
    setItems(itemsObject) { /*//DOC
        Set all the items belonging to this group.  Example:
        setItems({ home: home, settings: settings })
        */
        this.widgets = itemsObject;
        this.makeList();
    }
    makeList() {
        this.itemList = Object.values(this.widgets);
        for (const item of this.itemList) {
            item.setVisible(false);
        }
        if (this.itemList.length >= 1) {
            this.itemList[0].setVisible(true)
        }
    }

} // Group

export { Group }
