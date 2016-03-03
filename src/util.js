exports.formatSize = function (size) {
    size = parseFloat(size);
    const prefixesSI = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        base = 1024;
    let index = size ? Math.floor(Math.log(size) / Math.log(base)) : 0;
    index = Math.min(index, prefixesSI.length - 1);
    let powedPrecision = Math.pow(10, index < 2 ? 0 : (index > 2 ? 2 : 1));
    size = size / Math.pow(base, index);
    size = Math.round(size * powedPrecision) / powedPrecision;
    return size + prefixesSI[index] + 'B';
};

exports.parseSize = function (size) {
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
};

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

function normalizeAccept(accepts) {
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

exports.normalizeAccept = normalizeAccept;

    function createOptions(option) {
    const options = {};
    (option.match(/\S+/g) || []).forEach((flag) => {
        options[flag] = true;
    });
    return options;
}

function extend(target, source) {
    for (let key in source) {
        target[key] = source[key];
    }
    return target;
}

exports.extend = extend;

function isFunction(obj) {
    return typeof obj === 'function';
}

const ArrayFrom = Array.from || function (arrayLike) {
    return [].slice.call(arrayLike);
};

function Callbacks(options) {
    options = typeof options === "string"
        ? createOptions(options)
        : extend({}, options);

    let firing, memory, fired, firingLength, firingIndex, firingStart,
        list = [], _this,
        stack = !options.once && [],
        fire = function (data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
                if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                    memory = false; // To prevent further calls using add
                    break;
                }
            }
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        fire(stack.shift());
                    }
                } else if (memory) {
                    list = [];
                } else {
                    _this.disable();
                }
            }
        };

    _this = {
        add() {
            if (list) {
                let start = list.length;

                (function add(args) {
                    args.forEach((fn) => {
                        if (isFunction(fn)) {
                            if (!options.unique || !_this.has(fn)) {
                                list.push(fn);
                            }
                        } else if (Array.isArray(fn)) {
                            add(fn);
                        }
                    });
                })(ArrayFrom(arguments));

                if (firing) {
                    firingLength = list.length;
                } else if (memory) {
                    firingStart = start;
                    fire(memory);
                }
            }
            return this;
        },

        remove() {
            if (list) {
                ArrayFrom(arguments).forEach((fn) => {
                    let i = list.length;
                    while (--i >= 0) {
                        if (list[i] !== fn) continue;

                        list.splice(i, 1);

                        if (firing) {
                            if (i <= firingLength) {
                                firingLength--;
                            }
                            if (i <= firingIndex) {
                                firingIndex--;
                            }
                        }
                    }
                });
            }
            return this;
        },

        has(fn) {
            return fn ? list.indexOf(fn) > -1 : !!(list && list.length);
        },

        empty() {
            list = [];
            firingLength = 0;
            return this;
        },

        disable() {
            list = stack = memory = null;
            return this;
        },

        disabled() {
            return !list;
        },

        lock() {
            stack = null;
            if (!memory) {
                _this.disable();
            }
            return this;
        },

        locked() {
            return !stack;
        },

        fireWith(context, args) {
            if (list && (!fired || stack)) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                if (firing) {
                    stack.push(args);
                } else {
                    fire(args);
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

function Deferred(func) {
    let tuples = [
        ["resolve", "done", Callbacks("once memory"), "resolved"],
        ["reject", "fail", Callbacks("once memory"), "rejected"],
        ["notify", "progress", Callbacks("memory")]
    ],
    state = "pending",
    promise = {
        state() {
            return state;
        },

        always() {
            const args = ArrayFrom(arguments);
            deferred.done(args).fail(args);
            return this;
        },

        then(/* fnDone, fnFail, fnProgress */) {
            let fns = arguments;
            return Deferred((newDefer) => {
                tuples.forEach((tuple, i) => {
                    let fn = isFunction(fns[i]) && fns[i];
                    deferred[tuple[1]](function () {
                        const returned = fn && fn.apply(this, arguments);
                        if (returned && isFunction(returned.promise)) {
                            returned.promise()
                                .done(newDefer.resolve)
                                .fail(newDefer.reject)
                                .progress(newDefer.notify);
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

        promise(obj) {
            return obj != null ? extend(obj, promise) : promise;
        }
    }, deferred = {};

    promise.pipe = promise.then;

    tuples.forEach((tuple, i) => {
        let list = tuple[2],
            stateString = tuple[3];

        promise[tuple[1]] = list.add;

        if (stateString) {
            list.add(
                () => { state = stateString; },
                tuples[i^1][2].disable,
                tuples[2][2].lock
            );
        }

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

exports.Deferred = Deferred;