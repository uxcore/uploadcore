import Set from './set';
import {Deferred} from 'jquery';

class AspectHook {
    constructor(hooks, initialData) {
        this.data = initialData;
        this.error = null;

        const i = Deferred();
        i.promise(this);

        let aborted;

        const fail = (e) => {
            if (aborted) return;
            if (e) {
                this.setError(e instanceof Error ? e : new Error(e));
            }
            i.reject(this.error || new Error('Unknown'));
        };

        const done = () => {
            if (aborted) return;
            if (this.hasError()) {
                fail();
            } else {
                i.resolve(this.data);
            }
        };

        const next = (data) => {
            if (aborted) return;

            if (data && (data instanceof Error)) {
                this.setError(data);
            } else {
                this.setData(data);
            }

            if (this.hasError()) {
                return fail();
            }

            const hook = hooks.shift();
            if (!hook) {
                return done();
            }
            let ret;
            try {
                ret = hook.call(this, this.data);
            } catch (e) {
                return fail(e);
            }

            if (ret && ret.then) {
                ret.then(next, fail);
            } else {
                next(ret);
            }
        };

        this.abort = () => {
            aborted = true;
        };

        setTimeout(next, 1);
    }
    hasError() {
        return this.error != null;
    }
    setError(error) {
        this.error = error;
    }
    setData(data) {
        if (data != null && (this.data == null || data.constructor === this.data.constructor)) {
            this.data = data;
        }
    }
}

class Aspect {
    constructor() {
        this.hooks = new Set;
    }

    add(hook) {
        if (typeof hook === 'function') {
            this.hooks.add(hook);
        }
        return this;
    }

    invoke(data) {
        return new AspectHook(this.hooks.toArray(), data);
    }
}

export default class Aspector {
    constructor() {
        this.aspects = {};
    }

    /**
     * @param {string} aspect
     * @returns {Aspect}
     */
    getAspect(aspect) {
        if (!(aspect in this.aspects)) {
            this.aspects[aspect] = new Aspect;
        }
        return this.aspects[aspect];
    }
}
