import { Widget, Signal, randomID } from './widget.js';

class SidebarMenuItem extends Widget { /*//DOC
    Implements (together with SidebarMenu) the following hierarchical and recursive scheme:
    ```
    menu
        child_activate_slot
            call all children(s) deactivate
        children:
            - item
                UP:
                    - signal activate --> connected to parent's child_activate_slot
                IN:
                    - child_activate_slot
                        - emit signal.activate
                        - activate self
                    - deactivate
                        - call all children(s) deactivate
                        - deactivate self
                when clicked:
                        emit signal.clicked
                        emit signal.activate
                        activate self
                children:
                    - item
                        UP:
                            - signal activate --> connected to parent's child_activate_slot
                        IN:
                            - child_activate_slot
                                - emit signal.activate
                                - activate self
                            - deactivate
                                - call all children(s) deactivate
                                - deactivate self
                        when clicked:
                            emit signal.clicked
                            emit signal.activate
                            activate self
                    - item
                        ...
            - item
                ...
            ...
    ```
    */
    constructor(label, id, icon = null) { /*//DOC
        arguments: label text and a unique html id, optional: icon
        */
        super();
        this.label = label;
        this.id = id;
        this.icon = icon;
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.clicked = new Signal(`Emitted when this menu item is clicked`);
        this.signals.activate = new Signal(`Emitted when this menu item is highlighted/activated`);
    }


    clicked_slot() { /* //DOC
        Emulates click on this menu item
        */
        this.clicked()
    }

    child_activate_slot(obj) { /*//DOC 

        obj:
            child: item object
            lis: cumulated list

        - called by the child item(s) of this item
        - argument lis: list of SiderBarMenuItems propagating from nested levels
        - Send activate signal (connected to parent)
        - Activate self
        */

        var i = this.subMenuItems.indexOf(obj.child)
        obj.lis.unshift(i)
        this.signals.activate.emit({child:this, lis:obj.lis})
        this.activate();
    }

    createState() {
        this.active= false;
        // this.indentLevel = 0;
        this.subMenuItems = [];
    }

    createElement() {
        let uuid1=randomID();
        this.element = document.createElement('li');
        this.element.className = 'nav-item';
        this.element.style.paddingLeft = `0em`;
        // <a href="#" class="nav-link" id="${this.id}">
        // <i class="bi bi-chevron-right"></i>
        /*
          <button id="${this.id}" class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed" 
            data-bs-toggle="collapse" 
            data-bs-target="#home-collapse" aria-expanded="true">
        */
        this.element.innerHTML = `
            <a href="#" class="nav-link" id="${this.id}">
                <i class="bi bi-chevron-right" id="collapse-icon-${uuid1}" 
                style="transform: rotate(0deg); display: inline-block"></i>
                ${this.icon ? `<i class="${this.icon} me-2"></i>` : ''}
                ${this.label}
            </a>
            <div class="collapse hide" id="sub-collapse-${uuid1}">
                <ul class="nav nav-pills flex-column mb-auto" id="sub-items-${uuid1}">
            </div>
            </ul>
        `;
        this.itemElement = this.element.querySelector(`#${this.id}`);
        this.collapseIcon = this.element.querySelector(`#collapse-icon-${uuid1}`);
        this.collapseElement = this.element.querySelector(`#sub-collapse-${uuid1}`);
        this.subItemsElement = this.element.querySelector(`#sub-items-${uuid1}`);
        this.collapseIcon.style.visibility = 'hidden';
        this.itemElement.onclick = () => { this.clicked() };
    }

    /* // not needed..
    setIndentLevel(num) {
        this.indentLevel = num;
        // this.element.style.paddingLeft = `${this.indentLevel*1}em`;
        this.element.style.paddingLeft = `1em`;
    }
    */

    expand() {
        if (this.collapseElement.classList.contains('hide')) { // was collapsed
            this.collapseElement.classList.remove('hide');
            this.collapseElement.classList.add('show');
            this.collapseIcon.style.transform = `rotate(90deg)`;
        }
    } // was collapsed


    clicked() {
        if (this.subMenuItems.length > 0) { // has subitems (i.e. is a node instead of an item)
            if (this.collapseElement.classList.contains('hide')) { // was collapsed
                this.collapseElement.classList.remove('hide');
                this.collapseElement.classList.add('show');
                this.collapseIcon.style.transform = `rotate(90deg)`;
            } // was collapsed
            else { // was open
                if (this.active) {
                    // active subitem lists cannot be collapsed
                    // so that the user actually knows where (s)he is
                }
                else {
                    this.collapseElement.classList.remove('show');
                    this.collapseElement.classList.add('hide');
                    this.collapseIcon.style.transform = `rotate(0deg)`;
                }
            } // was open
            this.signals.clicked.emit();
        } // has subitems
        else { // is an actual item
            this.signals.activate.emit({child:this, lis:[]})
            //.. that signal will propagate all the way to the root parent
            this.signals.clicked.emit();
            this.activate();
        } // is an actual item
    }

    setItems(itemsObject) { /*//DOC
        Add any number of SidebarMenuItem(s)
        */
        // Store the named mapping
        this.widgets = itemsObject;
        // Convert object to array for iteration
        this.subMenuItems = Object.values(itemsObject);
        for (const item of this.subMenuItems) {
            // item.setIndentLevel(this.indentLevel+1);
            let el = item.getElement()
            el.style.paddingLeft = `1em`;
            this.subItemsElement.appendChild(el);
            item.signals.activate.connect(this.child_activate_slot.bind(this));
            item.setLogLevel(this.loglevel);
        }
        this.collapseIcon.style.visibility = 'visible';
    }

    getElement() {
        return this.element;
    }

    activate() {
        this.active = true;
        if (this.subMenuItems.length > 0) { // has subitems
        }
        else { // an actual item
            this.itemElement.classList.add('active');
        }
    }

    deactivate() {
        this.active = false;
        if (this.subMenuItems.length > 0) { // has subitems
        }
        else { // an actual item
            this.itemElement.classList.remove('active');
        }
        for (const item of this.subMenuItems) {
            item.deactivate()
        }
    }

    activateTree(lis) { /*//DOC
        lis: an instruction list indicating which sublement should be activated
        */
        this.log(-1, "activateTree", lis.length);
        if (this.subMenuItems.length > 0) { // has subitems
            this.expand()
            if (lis.len < 1) {
                return;
            }
            const i = lis.splice(0,1)[0] // take first number from the list
            this.log(-1, "activateTree: going for sublement", i, "with list", lis);
            this.subMenuItems[i].activateTree(lis) // pass down the hierarchy
        }
        else { // an actual item
            this.log(-1,"activateTree ended up in", this);
            this.activate();
            this.signals.clicked.emit();
        }
    }


}

class SidebarMenu extends Widget { /*//DOC
    For more details, see SidebarMenuItem docs (above in this same file)
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
    }

    createState() {
        this.menuItems = [];
        this.userEmail = '';
        this.hierarchy = [];
    }

    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            this.err("could not find element with id", this.id);
            return;
        }
        let uuid = randomID();
        // here the "d-lg-none" class hides/shows the button, depending on the screen size
        // for the vertical menu, I had to add explicitly the icon
        this.element.innerHTML = `
        <div class="sidebar-wrapper">
            <div class="d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary h-100" id="sidebar-container-${uuid}">
                <button class="navbar-toggler d-lg-none align-self-start" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#sidebar-${uuid}" aria-controls="sidebar-${uuid}" 
                        aria-expanded="false" aria-label="Toggle navigation">
                    <i class="bi bi-list fs-2"></i>
                </button>
                <div class="collapse d-lg-block" id="sidebar-${uuid}">
                    <ul class="nav nav-pills flex-column mb-auto" id="menu-items-${uuid}">
                    </ul>
                </div>
            </div>
        </div>
        `;
        this.container = this.element.querySelector(`#sidebar-container-${uuid}`);
        this.menuItemsElement = this.element.querySelector(`#menu-items-${uuid}`);
        /* // old
        this.element.innerHTML = `
            <div class="sidebar-wrapper">
                <div class="d-flex flex-column flex-shrink-0 p-3 bg-light h-100">
                    <ul class="nav nav-pills flex-column mb-auto" id="menu-items-${uuid}">
                    </ul>
                </div>
            </div>
        `;
        */
    }

    addMenuItem(menuItem) {
        this.menuItemsElement.appendChild(menuItem.getElement());
    }

    setItems(itemsObject) { /*//DOC
        Add any number of SidebarMenuItem(s) using named parameters
        Usage:
        setItems({ home: homeMenuItem, settings: settingsMenuItem })
        Access via:
        - this.widgets.home -> returns homeMenuItem object
        - this.menuItems -> array of all menu item objects
        */
        // Store the named mapping
        this.widgets = itemsObject;
        
        // Convert object to array for iteration
        this.menuItems = Object.values(itemsObject);
        
        // Process each menu item
        for (const item of this.menuItems) {
            item.setLogLevel(this.loglevel);
            this.addMenuItem(item);
            item.signals.activate.connect(this.child_activate_slot.bind(this));
        }
    }


    activateTree(lis) { /*//DOC
        an instruction list indicating which sublement should be activated
        */
        this.log(-1, "activateTree", lis.length);
        if (lis.length < 1) {
            return
        }
        const i = lis.splice(0,1)[0] // take first number from the list
        this.log(-1, "activateTree now", lis.length);
        this.menuItems[i].activateTree(lis) // pass down the hierarchy
    }

    deactivate() {
        for (const item of this.menuItems) {
            item.deactivate()
        }
    }

    child_activate_slot(obj) { /*//DOC
        obj:
            child: item object
            lis: cumulated list

        - called by the child item(s) of this item
        - argument lis: list of SiderBarMenuItems propagating from nested levels
        */
        var i = this.menuItems.indexOf(obj.child)
        obj.lis.unshift(i)
        this.hierarchy=structuredClone(obj.lis);
        this.log(-1, "child_activate_slot: hierarchy", this.hierarchy);
        this.deactivate();
        this.serialize();
    }

    hideItem(itemId) { /*//DOC
        Hide a menu item by its widget key
        @param {string} itemId - The key in this.widgets (e.g., "adminItem")
        */
        const item = this.widgets[itemId];
        if (item) {
            item.getElement().style.display = 'none';
        } else {
            this.log(0, `hideItem: No item found with id "${itemId}"`);
        }
    }

    showItem(itemId) { /*//DOC
        Show a menu item by its widget key
        @param {string} itemId - The key in this.widgets (e.g., "adminItem")
        */
        const item = this.widgets[itemId];
        if (item) {
            item.getElement().style.display = '';
        } else {
            this.log(0, `showItem: No item found with id "${itemId}"`);
        }
    }

    getSerializationValue() {
        /* state is encoded as a path of IDs, e.g. "admin.sub-item-1"
        representing the navigation path through the menu hierarchy
        */
        if (this.hierarchy.length === 0) {
            return "";
        }
        // Convert indices to IDs by traversing the menu structure
        const ids = [];
        let currentItems = this.menuItems;
        for (const index of this.hierarchy) {
            if (index >= 0 && index < currentItems.length) {
                const item = currentItems[index];
                ids.push(item.id);
                currentItems = item.subMenuItems;
            }
        }
        const s = ids.join(".");
        this.log(-1, "getSerializationValue", s);
        return s;
    }
    setState(serializationValue) {
        this.log(-1, "setState", serializationValue);
        if (typeof serializationValue !== "string" || serializationValue.length < 1) {
            return;
        }
        // Convert IDs to indices by traversing the menu structure
        const idPath = serializationValue.split(".");
        const indices = [];
        let currentItems = this.menuItems;
        for (const id of idPath) {
            const index = currentItems.findIndex(item => item.id === id);
            if (index === -1) {
                this.log(-1, "setState: could not find item with id", id);
                return; // Invalid path, abort
            }
            indices.push(index);
            currentItems = currentItems[index].subMenuItems;
        }
        // Deactivate all items first, then activate the path
        this.deactivate();
        this.activateTree(indices);
    }

}

export { SidebarMenu, SidebarMenuItem };

