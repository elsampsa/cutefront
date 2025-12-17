import { Widget, Signal } from './widget.js';
import { Group } from './group.js';

class ContainerWidget extends Group {
    /*//DOC
    Manages main content area that can host multiple child widgets.
    Only one child widget is visible at a time.
    Child widgets are set using setItems method.
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        super.createSignals(); // Get the state_change signal from Group
    }

    createState() {
        super.createState();
    }

    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            this.err("could not find element with id", this.id);
            return;
        }
        // Container stays empty - child widgets will be attached in setItems
    }

    setItems(widget_dict) { /*//DOC
        Set the child widgets for this container.
        Argument is an object where each key is widget name and value is the widget instance
        Example: {home: homeWidget, items: itemsWidget}
        */
        // Validate entries
        Object.entries(widget_dict).forEach(([key, widget]) => {
            if (!(widget instanceof Widget)) {
                this.err("Value must be Widget instance");
                return;
            }
        });

        // First remove any existing child elements
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        // Store reference to widgets
        this.widgets = widget_dict;
        
        // Get array of widgets for DOM manipulation
        const widgets = Object.values(widget_dict);
        
        // Attach each widget's element as a child to our container
        widgets.forEach(widget => {
            this.log(-1, ">", widget);
            if (!widget.element) {
                this.err("setItems: widget has no element");
                return;
            }
            this.element.appendChild(widget.element);
        });

        // Use Group's functionality to manage visibility
        super.makeList();
    }
}

export { ContainerWidget };
