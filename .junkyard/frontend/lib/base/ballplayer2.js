import { Signal } from './widget.js'; // paths for base widget inheritance
import { BillBoard, BallPlayer } from './ballplayer.js'; // extends ballplayer.js

class BillBoard2 extends BillBoard { /*//DOC
    Extends class BillBoard.  This widget knows how to (de)serialize it's state
    */
    createSignals() {
        this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
    }
    ball_throw_slot() { /*//DOC
        Sending signal to this slot, increments the number of how many times
        a ball has been thrown
        */
        super.ball_throw_slot();
        this.serialize();
    }
    getSerializationValue() {
        return this.counter.toString();
    }
    setState(serializationValue) {
        const val = parseInt(serializationValue);
        if (isNaN(val)) {
            return;
        }
        this.counter = val;
        this.log(-1, "setState: counter", this.counter);
        this.updateMessage();
    }
}

class BallPlayer2 extends BallPlayer { /*//DOC
    Extends class BallPlayer.  This widget knows how to (de)serialize it's state
    */
    createSignals() {
        super.createSignals();
        this.signals.state_change = new Signal("State change. Carries { serializationKey, serializationValue, write }");
    }
    catch_ball_slot() { /*//DOC
        Sending a signal to this slot, gives the ball to this widget
        */
        super.catch_ball_slot();
        this.serialize();
    }
    getSerializationValue() {
        // encode boolean as "ball" or "noball" for readability
        const val = this.has_ball ? "ball" : "noball";
        this.log(-1, "getSerializationValue", val);
        return val;
    }
    setState(serializationValue) {
        if (serializationValue === "ball") {
            this.has_ball = true;
        } else if (serializationValue === "noball") {
            this.has_ball = false;
        } else {
            // fallback: try parsing as 0/1 for backwards compatibility
            const i = parseInt(serializationValue);
            if (i === 1) {
                this.has_ball = true;
            } else if (i === 0) {
                this.has_ball = false;
            } else {
                return; // invalid value
            }
        }
        this.log(-1, "setState", this.has_ball);
        this.setBall();
    }
    createState() {
        super.createState();
        this.serialize();
        // initialize to not having a ball
    }
    throwBall() {
        if (!this.has_ball) {
            // we don't have the ball..
            return;
        }
        this.has_ball = false;
        this.setBall();
        this.serialize();
        this.signals.throw_ball.emit();
    }

} // BallPlayer

export { BallPlayer2, BillBoard2 }
