import { Widget, Signal } from '../base/widget.js';

class Marked extends Widget { /*//DOC
    Renders given markdown as html
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.file_read_ok = new Signal(); /*//DOC carries string: filename */
        this.signals.file_read_error = new Signal(); /*//DOC carries string: filename */
    }
    render_string_slot(input) { /*//DOC
        render markdown as html from an input string
        */
        this.render(input)
    }
    scroll_to_slot(id) { /*//DOC
        Scrolls to a certain html element, identified with an id
        */
        var el = this.element.querySelector(`#${id}`);
        if (el == null) {
            this.err(`scroll_to_slot: could not find ${id}`);
            return;
        }
        this.log(-1, "scrolling to", id);
        el.scrollIntoView({ behavior: 'smooth', block: 'center'})
    }
    clear_slot() { /*//DOC
        Clear the html contents
        */
        this.render("")
    }
    render_file_slot(fname) { /*//DOC
        render markdown from a file in a relative path, say: 
        ./text.md or ../text.md or ../someplace_else/text.md, etc.
        */
        const url = new URL(fname, window.location);
        this.log(-1, "render_file_slot:", url.href);
        this.read(url.href).then( resp => {
            if (resp) {
                this.signals.file_read_ok.emit();
                this.render(resp);
            }
            else {
            } 
        })
    }
    render_file_origin_slot(fname) { /*//DOC
        render markdown specifying a path relative to origin
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
        this.element.innerHTML =
            marked.parse(input);
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

} // Marked

export { Marked }
