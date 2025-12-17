import { Widget, Signal, randomID } from './widget.js';

class Navitem extends Widget { /*//DOC A menu item that can be placed into Navbar
    Arguments: title that is shown and a tag that is send with the signal once the navitem is clicked
    */
    constructor(title, tag) {
        super();
        this.title = title;
        this.tag = tag;
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.clicked = new Signal(`Emitted when this item is clicked.  Carries tag defined in ctor.`);
    }
    left_slot() { /*//DOC Aligns this item to the left.
    No parameters.
    */
        this.element.classList.add("ml-auto");
        this.element.classList.remove("mr-auto");
    }
    right_slot() { /*//DOC Aligns this item to the right.
    No parameters.
    */
        this.element.classList.add("mr-auto");
        this.element.classList.remove("ml-auto");
    }
    createState() {
        if (this.element == null) {
            return
        }
        // a Navitem can have subitems :)
        this.navitems = new Array();
    }
    close() {
    }
    createElement() {
        this.element = document.createElement("li");
        this.element.className="nav-item";
        this.element.innerHTML 
            = `<span class="nav-link active">${this.title}</span>`
        this.link = this.element.getElementsByTagName("span").item(0)
        this.link.style.cursor="pointer"
        this.link.onclick = (event) => {
            this.signals.clicked.emit(this.tag)
        }
    }
    getElement() { // parent uses this to attach it to the html tree
        return this.element;
    }
    // if a dropdown list element --> encapsulate with <li>
    // if has dropdown list element --> etc.

    toDropdown() {
        this.element.className="nav-item dropdown";
        this.element.innerHTML = `
        <span class="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            ${this.title}
        </span>
        <ul class="dropdown-menu">
        </ul>
        `
        this.link = this.element.getElementsByTagName("span").item(0)
        this.link.style.cursor="pointer"
        this.link.onclick = (event) => {
            this.signals.clicked.emit(this.tag)
        }

        this.list_element = this.element.getElementsByTagName("ul").item(0)
    }
    toDropdownItem() {
        this.link.className="dropdown-item"
    }

    setItems(...navitems) { /*//DOC
        Call immediately after constructor to set sub menu items.  
        Give each sub Navitem object, separated by a comma.
        */
        // remove earlier Navitem(s)
        for (const navitem of this.navitems) {
            navitem.close();
            this.list_element.removeChild(navitem.getElement());
        }
        delete this.navitems;
        this.navitems = new Array();
        var is_dropdown = false; // we're not a dropdown menu..
        // create a new list of internal Navitem(s)
        for (const navitem of navitems) {
            if (!(navitem instanceof Navitem)) {
                this.err("addItem: needs a NavItem object instance");
            }
            else {
                navitem.toDropdownItem(); // inform item it belongs to a dropdown menu (i.e. that it's a dropdown item)
                is_dropdown = true; // and we are a dropdown menu
                this.navitems.push(navitem)
            }
        }
        if (is_dropdown) { this.toDropdown(); } // creates this.list_element
        // put in new Navitem(s) html
        for (const navitem of this.navitems) {
            this.list_element.appendChild(navitem.getElement());
        }
    }

} // Navitem

class Navbar extends Widget { /*//DOC A horizontal navigation bar where you can place Navitems (menu items).
    Ctor argument: id of the <nav> element and a title for the navbar
    Requires ``<link href="./lib/base/navbar-fixed.css" rel="stylesheet">`` in the main html file
    */
    constructor(id, title) {
        super(id);
        this.title = title;
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.clicked = new Signal(`Emitted when this Navbar is clicked.  Carries nothing.`);
    }
    reset_scroll_slot() { /*//DOC 
        Resets the page scroll state, so that the whole page is scrolled to y=0, taking into account navbar's height
        */
        var navbarHeight = this.element.offsetHeight;
        this.log(-1, "navbarHeight>", navbarHeight);
        // Scroll to the top position, subtracting the navbar height
        window.scrollTo({
            top: 0 - navbarHeight,
            behavior: 'smooth'
        });
    }
    createState() {
        if (this.element == null) {
            return
        }
        this.navitems = new Array();
    }
    createElement() {
        // hook into html elements and/or create new ones, etc.
        // for example:
        // this.element = document.getElementById(this.id)
        // this.element = document.createElement("tr")
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
        if (this.element.tagName.toLocaleLowerCase() != "nav") {
            this.element = null;
            this.err("element must be of type 'nav'")
            return;
        }
        // let's not overwrite user-defined classes..
        // this.element.className="navbar navbar-expand-lg fixed-top navbar-dark bg-dark"
        this.addClasses("navbar","navbar-expand-lg","fixed-top")
        // "off-canvas navbar" example:
        // <nav class="navbar navbar-expand-lg fixed-top navbar-dark           bg-dark" aria-label="Main navigation">
        // "fixed navbar" example:
        // <nav class="navbar navbar-expand-md fixed-top navbar-dark           bg-dark">
        //
        /* // some more html just in case..
        this.element.innerHTML=`
        <div class="container-fluid">
            <a class="navbar-brand" href="#">${this.title}</a>
            <button class="navbar-toggler p-0 border-0" type="button" id="navbarSideCollapse" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                </ul>
            </div>
        </div>   
        `
        this.link = this.element.getElementsByTagName("a").item(0)
        this.link.onclick = (event) => {
            this.signals.clicked.emit()
        }
        */
        let navbar_side_collapse=randomID()
        let navbar_contents=randomID()
        let left=randomID()
        // the button would require "d-lg-none" class to hide/show it, depending on the screen size
        // but that is probably added there automagically by the combo of "container-fluid" & "navbar-toggler" ?
        // compare to sidebarwidget.js
        this.element.innerHTML=`
        <div class="container-fluid">
            <span class="navbar-brand">${this.title}</span>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" id="${navbar_side_collapse}" 
            data-bs-target="#${navbar_contents}" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="${navbar_contents}">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0"> 
                    <!-- navbar items inserted here -->
                </ul>
                <div class="me-5">
                    <div class="row justify-content-evenly" id="${left}">
                    <!-- stuff that appears left in the navbar inserted here -->
                    </div>
                </div>
            </div>
        </div> 
        `
        this.link = this.element.getElementsByTagName("span").item(0)
        this.link.style.cursor="pointer"
        this.link.onclick = (event) => {
            this.signals.clicked.emit()
        }
        this.list_element = this.element.getElementsByTagName("ul").item(0)
        this.left_elements = this.element.querySelector(`#${left}`);
        /* // add stuff to the left of the navbar like this:
        let div = document.createElement("div")
        this.left_elements.appendChild(div)
        div.className="col-2"
        div.innerHTML=`<i class="fab fa-github text-primary h1">yes</i>`
        */
    }
    divLeft() { /*//DOC
        Returns a new div element placed to the left of the navbar
        */
        var div = document.createElement("div")
        this.left_elements.appendChild(div)
        div.className="col-1"
        return div
    }
    setItems(...navitems) { /*//DOC
        Call immediately after constructor to set NavItem menu items.
        Give each Navitem object, separated by a comma.
        */
        // remove earlier Navitem(s)
        for (const navitem of this.navitems) {
            navitem.close();
            this.list_element.removeChild(navitem.getElement());
        }
        delete this.navitems;
        this.navitems = new Array();
        // create a new list of internal Navitem(s)
        for (const navitem of navitems) {
            if (!(navitem instanceof Navitem)) {
                this.err("addItem: needs a NavItem object instance");
            }
            else {
                this.navitems.push(navitem)
            }
        }
        // put in new Navitem(s) html
        for (const navitem of this.navitems) {
            this.list_element.appendChild(navitem.getElement());
        }
    }


} // Navbar

class HomePageNavbar extends Navbar { /*//DOC A horizontal navigation bar where you can place Navitems (menu items) for a homepage.
    Additional methods for putting links for github, stackoverflow, etc.
    Ctor argument: id of the <nav> element and a title for the navbar
    Requires ``<link href="./lib/base/navbar-fixed.css" rel="stylesheet">`` in the main html file
    */
    constructor(id, title) {
        super(id, title)
    }

    setGithub(link) { /*//DOC Adds a github symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-github text-primary h1"></i>
            </a>`
    }
    setFacebook(link) { /*//DOC Adds a facebook symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-facebook text-primary h1"></i>
            </a>
            `
    }
    setSO(link) { /*//DOC Adds a stackoverflow symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-stack-overflow text-primary h1"></i>
            </a>
            `
    }
    setLinkedin(link) { /*//DOC Adds a linkedin symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-linkedin text-primary h1"></i>
            </a>
            `
    }
    setYoutube(link) { /*//DOC Adds a linkedin symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-youtube text-primary h1"></i>
            </a>
            `
    }
    setDiscord(link) { /*//DOC Adds a linkedin symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-discord text-primary h1"></i>
            </a>
            `
    }
    setGooglescholar(link) { /*//DOC Adds a google-scholar symbol and link to the left of the navbar.
        Argument: the hyperlink address
        */
        let div=this.divLeft()
        // <i class="fa-brands fa-google-scholar text-primary h1"></i> // doesn't work..
        div.innerHTML=`
            <a href="${link}" target="_blank" rel="noopener noreferrer">
            <i class="fa fa-scroll text-primary h1"></i>
            </a>
            `
    }


}

export { Navbar, HomePageNavbar, Navitem }


