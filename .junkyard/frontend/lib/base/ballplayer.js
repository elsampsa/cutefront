import { Widget, Signal } from './widget.js'; // path for base widget inheritance

class BillBoard extends Widget { /*//DOC
    A div element that shows a text indicating how many times a ball has been thrown.
    This widget is part of the CuteFront documentation demo
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() { // no outgoing signals
    }
    ball_throw_slot() { /*//DOC
        Sending signal to this slot, increments the number of how many times
        a ball has been thrown
        */
        this.log(-1, "ball_throw_slot")
        this.counter += 1
        this.updateMessage()
    }
    createState() {
        if (this.element == null) {
            this.err("no html element")
            return
        }
        this.counter = 0 // the one-and-only state variable: how many times ball has been thrown
        this.updateMessage()
    }
    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
        this.element.innerHTML=`
        <div class="alert alert-primary" role="alert">
        </div>
        `
        this.text_par=this.element.children[0]
    }
    updateMessage() {
        this.text_par.innerHTML=`
        Ball has been thrown ${this.counter} times
        `
    }
}

class BallPlayer extends Widget { /*//DOC
    An widget that has a button to throw the ball and a text indicating if this widget has the ball 
    or not
    */
    constructor(id) {
        super();
        this.id = id;
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.throw_ball = new Signal("Sends the ball to another widget");
    }
    catch_ball_slot() { /*//DOC
        Sending a signal to this slot, gives the ball to this widget
        */
        this.log(-1, "catch_ball_slot")
        this.has_ball = true
        this.setBall()
    }
    createState() {
        if (this.element == null) {
            this.err("no html element")
            return
        }
        this.has_ball = false // the only state variable
        this.setBall() // initialize to not having a ball
    }
    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
        this.element.innerHTML=`
        <button class="btn btn-outline-primary">Throw</button>
        `
        this.button=this.element.getElementsByTagName("button").item(0)
        this.button.onclick = (event) => {
            this.throwBall()
        }
    }
    throwBall() {
        if (!this.has_ball) {
            // we don't have the ball..
            return
        }
        this.has_ball = false
        this.setBall()
        this.signals.throw_ball.emit()
    }
    setBall() { // changes html element appearance according this.has_ball
        if (this.has_ball) {
            this.button.innerHTML=`Throw me (I have the ball!)`
            this.button.className="btn btn-outline-primary"
        }
        else {
            this.button.innerHTML=`Throw`
            this.button.className="btn btn-outline-primary"
        }
    }
    
} // BallPlayer

export { BallPlayer, BillBoard }
