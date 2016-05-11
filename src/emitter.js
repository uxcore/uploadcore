const {Deferred} = require('./util');

class Emitter {

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

    setPropagationTarget(emitter) {
        if (emitter instanceof Emitter) {
            this.propagationTarget = emitter;
        }
    }

    emit(event, ...args) {
        this.applyEmit(event, args);
    }

    applyEmit(event, args) {
        event = event.toLowerCase();

        let listeners;

        if (this._events && (listeners = this._events[event])) {
            listeners.slice(0).forEach((fn) => {
                if (listeners.indexOf(fn) !== -1) {
                    fn.apply(this, args)
                }
            });
        }

        if (this.propagationTarget) {
            const pArgs = args.slice(0);
            pArgs.unshift(this);
            this.propagationTarget.applyEmit(event, pArgs);
        }

        return this;
    }

    invoke(event, data) {
        event = event.toLowerCase();

        let listeners;

        if (!this._events || !(listeners = this._events[event])) {
            listeners = [];
        }

        return HookInvoker(listeners.slice(0), data, this);
    }
}

module.exports = Emitter;

function HookInvoker(hooks, initialData, context) {
    let _data = initialData;
    let _error = null;
    let _aborted;

    const i = Deferred();
    const ret = i.promise();

    ret.abort = () => {
        _aborted = true;
    };

    const fail = (e) => {
        if (_aborted) return;
        if (e) {
            _error = e instanceof Error ? e : new Error(e);
        }
        i.reject(_error || new Error('Unknown'));
    };

    const done = () => {
        if (_aborted) return;
        if (_error != null) {
            fail();
        } else {
            i.resolve(_data);
        }
    };

    const setData = (data) => {
        if (data != null && (_data == null || data.constructor === _data.constructor)) {
            _data = data;
        }
    };

    const next = (data) => {
        if (_aborted) return;

        if (data instanceof Error) {
            _error = data;
        }

        if (_error != null) {
            return fail();
        }

        setData(data);

        const hook = hooks.shift();
        if (!hook) {
            return done();
        }
        let res;
        try {
            res = hook.call(context, _data);
        } catch (e) {
            return fail(e);
        }

        if (res && res.then) {
            res.then(next, fail);
        } else {
            next(res);
        }
    };

    setTimeout(next, 1);

    return ret;
}

