import { Widget, Signal } from './widget.js';

class Include extends Widget { /*//DOC 
    Render html to the current DOM from a local file or from a string
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.file_read_ok = new Signal(`Emitted when a local html file has been succesfully read`);
        this.signals.file_read_error = new Signal(`Emitted when there was an error in reading a local html file.  Carries name of the local file.`);
    }
    render_string_slot(input) { /*//DOC Renders html from an input string */
        this.render(input)
    }
    render_file_slot(fname) { /*//DOC Renders html from a file in a relative path, say:
        ./text.html or ../text.html or ../someplace_else/text.html, etc.
        */
        const url = new URL(fname, window.location);
        this.log(-1, "render_file_slot:", url.href);
        this.read(url.href).then( resp => {
            if (resp) {
                this.signals.file_read_ok.emit();
                this.render(resp);
            }
        })
    }
    render_file_origin_slot(fname) { /*//DOC Renders html specifying a path relative to origin
        */
        let org = window.location.origin;
        if (org == "null" || !org) { // its a string "null" !
            this.signals.file_read_error.emit("render_file_origin_slot: origin is null");
            return;
        }
        const url = new URL(fname, org);
        this.log(-1, "render_file_root_slot:", url.href);
        this.read(url.href).then( resp => {
            if (resp) {
                this.signals.file_read_ok.emit();
                this.render(resp);
            }
        })
    }
    createState() {
    }
    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
    }
    render(input) {
        this.element.innerHTML = input;
    }
    async read(url) {
        const head = new Headers();
        const pars = {
            method: 'GET',
            // headers: head,
            // mode: 'cors',
            // cache: 'default',
        };
        this.log(-1, "read: url", url);
        var response;
        const req = new Request(url)
        try {
            response = await fetch(req, pars)
        } catch (error) {
            this.err(`read: fetch for '${url}' failed with`, error)
            this.signals.file_read_error.emit(
                `Error "${String(error)}" when reading ${url}`
            )
            return null;
        }
        var txt;
        try {
            var txt = await response.text();
        } catch (error) {
            this.err("read: failed with", error)
            this.signals.file_read_error.emit(
                `Error "${String(error)}" when reading ${url}`
            )
            return null;
        }
        // this.log(-1, "txt", txt);
        return txt
    }

} // Include

export { Include }
