export default class Emitter {

    on(event, listener) {
        event = event.toLowerCase();
        if (!this._events) {
            this._events = {};
        }

        if (!this._events[event]) {
            this._events[event] = [];
        }

        this._events[event].push(listener);

        return this;
    }

    once(event, listener) {
        event = event.toLowerCase();

        let that = this;

        function fn() {
            that.off(event, fn);
            listener.apply(this, arguments);
        }

        fn.listener = listener;

        this.on(event, fn);

        return this;
    }

    off(event, listener) {
        event = event.toLowerCase();

        let listeners;

        if (!this._events || !(listeners = this._events[event])) {
            return this;
        }

        let i = listeners.length;
        while (i-- > 0) {
            if (listeners[i] === listener || listeners[i].listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }

        if (listeners.length === 0) {
            delete this._events[event];
        }

        return this;
    }

    removeAllListeners(event) {
        if (!event) {
            this._events = [];
        } else {
            delete this._events[event.toLowerCase()];
        }

        return this;
    }

    emit(event, ...args) {
        event = event.toLowerCase();

        let listeners;

        if (!this._events || !(listeners = this._events[event])) {
            return this;
        }

        listeners = listeners.slice(0);

        listeners.forEach(fn => fn.apply(this, args));

        return this;
    }
}
