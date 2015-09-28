export function formatSize(size) {
    size = parseFloat(size);
    const prefixesSI = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        base = 1024;
    let index = size ? Math.floor(Math.log(size) / Math.log(base)) : 0;
    index = Math.min(index, prefixesSI.length - 1);
    let powedPrecision = Math.pow(10, index < 2 ? 0 : (index > 2 ? 2 : 1));
    size = size / Math.pow(base, index);
    size = Math.round(size * powedPrecision) / powedPrecision;
    return size + prefixesSI[index] + 'B';
}

export function parseSize(size) {
    if (typeof size !== 'string') {
        return size;
    }

    const units = {
        t: 1099511627776,
        g: 1073741824,
        m: 1048576,
        k: 1024
    };

    size = /^([0-9\.]+)([tgmk]?)b?$/i.exec(size);
    const u = size[2];
    size = +size[1];

    if (units.hasOwnProperty(u)) {
        size *= units[u];
    }
    return size;
}

const ACCEPTs = {
    images: {
        title: 'Images',
        extensions: ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'svg', 'tiff', 'tif', 'ico', 'jpe', 'svgz', 'pct', 'psp', 'ai', 'psd', 'raw', 'webp']
    },

    audios: {
        title: 'Audios',
        extensions: ['aac', 'aif', 'flac', 'iff', 'm4a', 'm4b', 'mid', 'midi', 'mp3', 'mpa', 'mpc', 'oga', 'ogg', 'ra', 'ram', 'snd', 'wav', 'wma']
    },

    videos: {
        title: 'Videos',
        extensions: ['avi', 'divx', 'flv', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ogm', 'ogv', 'ogx', 'rm', 'rmvb', 'smil', 'webm', 'wmv', 'xvid']
    }
};

function normalizeExtensions(extensions) {
    if (typeof extensions !== 'string') {
        return '';
    }

    return extensions.toLowerCase().split(/ *[ ,;|+] */).map((ext) => {
        let m = /^\*?\.?(\w+)$/.exec(ext);
        return m ? m[1] : null;
    }).filter(ext => ext !== null);
}

export function normalizeAccept(accepts) {
    if (!accepts) return null;

    if (!Array.isArray(accepts)) {
        accepts = [accepts];
    }

    return accepts.map((accept) => {
        if (typeof accept === 'string' && (accept = accept.toLowerCase()) && ACCEPTs.hasOwnProperty(accept)) {
            return ACCEPTs[accept];
        } else {
            let extensions = normalizeExtensions(accept.extensions || accept);

            return extensions.length ? {
                title: accept.title || '',
                extensions: extensions,
                mimeTypes: accept.mimeTypes || ''
            } : null;
        }
    }).filter(accept => accept !== null);
}

function createOptions(option) {
    const options = {};
    (option.match(/\S+/g) || []).forEach((flag) => {
        options[flag] = true;
    });
    return options;
}

export function extend(target, source) {
    for (let key in source) {
        target[key] = source[key];
    }
    return target;
}

function isFunction(obj) {
    return typeof obj === 'function';
}

const ArrayFrom = Array.from || function (arrayLike) {
    return [].slice.call(arrayLike);
};

export function Callbacks(options) {
    options = typeof options === "string"
        ? createOptions(options)
        : extend({}, options);

    let firing, memory, fired, locked, list = [],
        queue = [], firingIndex = -1, _this;

    function fire() {
        locked = options.once;

        fired = firing = true;
        for (; queue.length; firingIndex = -1) {
            memory = queue.shift();
            while (++firingIndex < list.length) {
                if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                    firingIndex = list.length;
                    memory = false;
                }
            }
        }

        if (!options.memory) {
            memory = false;
        }

        firing = false;

        if (locked) {
            if (memory) {
                list = [];
            } else {
                list = "";
            }
        }
    }

    _this = {
        add() {
            if (list) {
                if (memory && !firing) {
                    firingIndex = list.length - 1;
                    queue.push(memory);
                }

                function add(args) {
                    args.forEach((fn) => {
                        if (isFunction(fn)) {
                            if (!options.unique || !_this.has(fn)) {
                                list.push(fn);
                            }
                        } else if (Array.isArray(fn)) {
                            add(fn);
                        }
                    });
                }

                add(ArrayFrom(arguments));

                if (memory && !firing) {
                    fire();
                }
            }
            return this;
        },

        remove() {
            ArrayFrom(arguments).forEach((fn) => {
                let i = list.length;
                while (--i >= 0) {
                    if (list[i] === fn) {
                        list.splice(i, 1);

                        if (i <= firingIndex) {
                            firingIndex--;
                        }
                    }
                }
            });
            return this;
        },

        has(fn) {
            return fn ? list.indexOf(fn) > -1 : list.length > 0;
        },

        empty() {
            if (list) {
                list = [];
            }
            return this;
        },

        disable() {
            locked = queue = [];
            list = memory = "";
            return this;
        },

        disabled() {
            return !list;
        },

        lock() {
            locked = queue = [];
            if (!memory && !firing) {
                list = memory = "";
            }
            return this;
        },

        locked() {
            return !!locked;
        },

        fireWith(context, args) {
            if (!locked) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                queue.push(args);
                if (!firing) {
                    fire();
                }
            }
            return this;
        },

        fire() {
            _this.fireWith(this, arguments);
            return this;
        },

        fired() {
            return !!fired;
        }
    };

    return _this;
};

function Identity(v) {
    return v;
}
function Thrower(ex) {
    throw ex;
}

export function Deferred(func) {
    let tuples = [
        ["notify", "progress", Callbacks("memory"), Callbacks("memory"), 2],
        ["resolve", "done", Callbacks("once memory"), Callbacks("once memory"), 0, "resolved"],
        ["reject", "fail", Callbacks("once memory"), Callbacks("once memory"), 1, "rejected"]
    ],
    state = "pending",
        deferred = {},
    promise = {
        state() {
            return state;
        },

        always() {
            const args = ArrayFrom(arguments);
            deferred.done(args).fail(args);
            return this;
        },

        "catch"(fn) {
            return promise.then(null, fn);
        },

        pipe(/* fnDone, fnFail, fnProgress */) {
            let fns = arguments;

            return Deferred((newDefer) => {
                tuples.forEach((tuple) => {
                    const fn = typeof fns[tuple[4]] === 'function' && fns[tuple[4]];

                    deferred[tuple[1]](function () {
                        const returned = fn && fn.apply(this, arguments);
                        if (returned && isFunction(returned.promise)) {
                            returned.promise()
                                .progress(newDefer.notify)
                                .done(newDefer.resolve)
                                .fail(newDefer.reject);
                        } else {
                            newDefer[tuple[0] + "With"](
                                this === promise ? newDefer.promise() : this,
                                fn ? [returned] : arguments
                            );
                        }
                    });
                });
                fns = null;
            }).promise();
        },

        then(onFulfilled, onRejected, onProgress) {
            let maxDepth = 0;

            function resolve(depth, deferred, handler, special) {
                return function () {
                    let _this = this === promise ? undefined : this,
                        args = arguments,
                        mightThrow = function () {
                            let returned, then;

                            if (depth < maxDepth) {
                                return;
                            }

                            returned = handler.apply(_this, args);

                            if (returned === deferred.promise()) {
                                throw new TypeError("Thenable self-resolution");
                            }

                            then = returned && (typeof returned === "object" ||
                                typeof returned === "function" ) &&
                                returned.then;

                            if (isFunction(then)) {
                                if (special) {
                                    then.call(
                                        returned,
                                        resolve(maxDepth, deferred, Identity, special),
                                        resolve(maxDepth, deferred, Thrower, special)
                                    );
                                } else {
                                    maxDepth++;

                                    then.call(
                                        returned,
                                        resolve(maxDepth, deferred, Identity, special),
                                        resolve(maxDepth, deferred, Thrower, special),
                                        resolve(maxDepth, deferred, Identity, deferred.notify)
                                    );
                                }
                            } else {
                                if (handler !== Identity) {
                                    _this = undefined;
                                    args = [returned];
                                }

                                (special || deferred.resolveWith)(_this || deferred.promise(), args);
                            }
                        },
                        process = special ? mightThrow : function () {
                            try {
                                mightThrow();
                            } catch (e) {
                                if (depth + 1 >= maxDepth) {
                                    if (handler !== Thrower) {
                                        _this = undefined;
                                        args = [e];
                                    }

                                    deferred.rejectWith(_this || deferred.promise(), args);
                                }
                            }
                        };

                    if (depth) {
                        process();
                    } else {
                        window.setTimeout(process, 0);
                    }
                };
            }

            return Deferred((newDefer) => {
                // progress
                tuples[0][3].add(
                    resolve(
                        0,
                        newDefer,
                        isFunction(onProgress) ? onProgress : Identity,
                        newDefer.notifyWith
                    )
                );

                // fulfilled
                tuples[1][3].add(
                    resolve(
                        0,
                        newDefer,
                        isFunction(onFulfilled) ? onFulfilled : Identity
                    )
                );

                // rejected
                tuples[2][3].add(
                    resolve(
                        0,
                        newDefer,
                        isFunction(onRejected) ? onRejected : Thrower
                    )
                );
            }).promise();
        },

        promise(obj) {
            return obj != null ? extend(obj, promise) : promise;
        }
    };

    tuples.forEach((tuple, i) => {
        let list = tuple[2],
            stateString = tuple[5];

        promise[tuple[1]] = list.add;

        if (stateString) {
            list.add(
                () => { state = stateString; },
                tuples[3 - i][2].disable,
                tuples[0][2].lock
            );
        }

        list.add(tuple[3].fire);

        deferred[tuple[0]] = function () {
            deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
            return this;
        };

        deferred[tuple[0] + "With"] = list.fireWith;
    });

    promise.promise(deferred);

    if (func) {
        func.call(deferred, deferred);
    }

    return deferred;
}
