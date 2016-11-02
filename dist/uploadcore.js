(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["UploadCore"] = factory();
	else
		root["UploadCore"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Core = __webpack_require__(1);
	var Events = __webpack_require__(4);
	
	var _require = __webpack_require__(5);
	
	var Status = _require.Status;
	
	Core.Events = Events;
	Core.Status = Status;
	Core.UploadCore = Core;
	Core.VERSION = ("2.3.1");
	Core.Core = Core;
	
	module.exports = Core;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Emitter = __webpack_require__(2);
	var Events = __webpack_require__(4);
	
	var _require = __webpack_require__(5);
	
	var Status = _require.Status;
	
	var _require2 = __webpack_require__(6);
	
	var QueueLimitError = _require2.QueueLimitError;
	var FilterError = _require2.FilterError;
	var DuplicateError = _require2.DuplicateError;
	var FileExtensionError = _require2.FileExtensionError;
	var FileSizeError = _require2.FileSizeError;
	
	var _require3 = __webpack_require__(3);
	
	var formatSize = _require3.formatSize;
	var parseSize = _require3.parseSize;
	var normalizeAccept = _require3.normalizeAccept;
	
	var FileRequest = __webpack_require__(7);
	var DndCollector = __webpack_require__(8);
	var PasteCollector = __webpack_require__(13);
	var PickerCollector = __webpack_require__(14);
	
	var REQUEST_OPTIONS = ['name', 'url', 'params', 'action', 'data', 'headers', 'withCredentials', 'timeout', 'chunkEnable', 'chunkSize', 'chunkRetries', 'chunkProcessThreads'];
	
	var Core = (function (_Emitter) {
	    _inherits(Core, _Emitter);
	
	    function Core() {
	        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	        _classCallCheck(this, Core);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Core).call(this));
	
	        _this.autoPending = options.autoPending || options.auto;
	        _this.capcity = options.capcity || options.queueCapcity || 0;
	        _this.multiple = options.multiple == null ? true : options.multiple;
	
	        _this.accept = normalizeAccept(options.accept);
	        _this.sizeLimit = parseSize(options.sizeLimit || options.fileSizeLimit || 0);
	
	        _this.pending = new Pending(options.processThreads);
	        _this.stat = new Stat();
	        _this.constraints = new Constraints();
	        _this.filters = new Filters();
	
	        _this.addConstraint(function () {
	            if (_this.capcity > 0) {
	                return _this.stat.getTotal() >= _this.capcity;
	            } else {
	                return false;
	            }
	        });
	
	        if (_this.accept && _this.accept.length > 0) {
	            _this.addFilter(function (file) {
	                if (!_this.accept.some(function (item) {
	                    return item.extensions && item.extensions.indexOf(file.ext) > -1;
	                })) {
	                    return new FileExtensionError(file, 'extension "' + file.ext + '" is not allowed');
	                }
	            });
	        }
	
	        if (_this.sizeLimit > 0) {
	            _this.addFilter(function (file) {
	                if (file.size > _this.sizeLimit) {
	                    return new FileSizeError(file, 'filesize:' + formatSize(file.size) + ' is greater than limit:' + formatSize(_this.sizeLimit));
	                }
	            });
	        }
	
	        if (options.preventDuplicate) {
	            _this.addFilter(function (file) {
	                if (_this.stat.getFiles().some(function (item) {
	                    return item.name === file.name && item.size === file.size;
	                })) {
	                    return new DuplicateError(file, 'file "' + file.name + '" already in queue');
	                }
	            });
	        }
	
	        if (Array.isArray(options.filters)) {
	            options.fitlers.forEach(function (filter) {
	                return _this.addFilter(filter);
	            });
	        }
	
	        var request = options.request || {};
	        REQUEST_OPTIONS.forEach(function (key) {
	            if (options.hasOwnProperty(key)) {
	                request[key] = options[key];
	            }
	        });
	
	        _this.requestOptions = request;
	        return _this;
	    }
	
	    _createClass(Core, [{
	        key: 'setOptions',
	        value: function setOptions(options) {
	            var _this2 = this;
	
	            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && !(options instanceof Array)) {
	                (function () {
	                    _this2.autoPending = options.autoPending || options.auto || _this2.autoPending;
	                    _this2.capcity = options.capcity || options.queueCapcity || _this2.capcity;
	                    _this2.sizeLimit = parseSize(options.sizeLimit || options.fileSizeLimit || _this2.sizeLimit);
	                    var requestOptions = _this2.requestOptions;
	                    REQUEST_OPTIONS.forEach(function (key) {
	                        if (options.hasOwnProperty(key)) {
	                            requestOptions[key] = options[key];
	                        }
	                    });
	                })();
	            } else {
	                console && console.error('setOptions: type error, options should be an object/hashMap');
	            }
	        }
	    }, {
	        key: 'createFileRequest',
	        value: function createFileRequest(file) {
	            return new FileRequest(file, this.requestOptions);
	        }
	    }, {
	        key: 'isLimit',
	        value: function isLimit() {
	            return this.constraints.some();
	        }
	    }, {
	        key: 'addConstraint',
	        value: function addConstraint(constraint) {
	            return this.constraints.add(constraint);
	        }
	    }, {
	        key: 'addFilter',
	        value: function addFilter(filter) {
	            return this.filters.add(filter);
	        }
	    }, {
	        key: 'add',
	        value: function add(file) {
	            var _this3 = this;
	
	            if (this.isLimit()) {
	                this.emit(Events.QUEUE_ERROR, new QueueLimitError());
	                return -1;
	            }
	
	            var error = this.filters.filter(file);
	            if (!error && !this.stat.add(file)) {
	                error = new DuplicateError(file, 'file "' + file.name + '" already in queue');
	            }
	
	            if (error) {
	                this.emit(Events.QUEUE_FILE_FILTERED, file, error);
	                this.emit(Events.QUEUE_ERROR, error);
	                return 0;
	            }
	
	            file.setStatus(Status.QUEUED);
	
	            file.on(Events.FILE_STATUS_CHANGE, function (status) {
	                if (status === Status.CANCELLED) {
	                    _this3.stat.remove(file);
	                } else if (status === Status.PENDING) {
	                    setTimeout(function () {
	                        if (_this3.pending.add(file) && _this3.pending.size() === 1) {
	                            _this3.emit(Events.QUEUE_UPLOAD_START);
	                        }
	                    }, 1);
	                }
	
	                _this3.emit(Events.QUEUE_STAT_CHANGE, _this3.stat);
	
	                if (_this3.stat.getFiles(Status.PROCESS).length < 1) {
	                    _this3.emit(Events.QUEUE_UPLOAD_END);
	                }
	            });
	
	            file.setCore(this);
	
	            this.emit(Events.QUEUE_FILE_ADDED, file);
	
	            this.emit(Events.QUEUE_STAT_CHANGE, this.stat);
	
	            if (this.autoPending) {
	                file.pending();
	            }
	
	            return 1;
	        }
	    }, {
	        key: 'isMultiple',
	        value: function isMultiple() {
	            return this.multiple;
	        }
	    }, {
	        key: 'isFull',
	        value: function isFull() {
	            return this.capcity > 0 && this.getTotal() >= this.capcity;
	        }
	    }, {
	        key: 'isEmpty',
	        value: function isEmpty() {
	            return this.getTotal() < 1;
	        }
	    }, {
	        key: 'getAccept',
	        value: function getAccept() {
	            return this.accept;
	        }
	    }, {
	        key: 'getStat',
	        value: function getStat() {
	            return this.stat;
	        }
	    }, {
	        key: 'getTotal',
	        value: function getTotal() {
	            return this.getStat().getTotal();
	        }
	    }, {
	        key: 'getFiles',
	        value: function getFiles(flag) {
	            return this.getStat().getFiles(flag);
	        }
	    }, {
	        key: 'stat',
	        value: function stat(flag) {
	            return this.getStat().stat(flag);
	        }
	    }, {
	        key: 'getPickerCollector',
	        value: function getPickerCollector() {
	            if (!this.picker) {
	                this.picker = new PickerCollector(this);
	            }
	            return this.picker;
	        }
	    }, {
	        key: 'getDndCollector',
	        value: function getDndCollector() {
	            if (!this.dnd) {
	                this.dnd = new DndCollector(this);
	            }
	            return this.dnd;
	        }
	    }, {
	        key: 'getPasteCollector',
	        value: function getPasteCollector() {
	            if (!this.paster) {
	                this.paster = new PasteCollector(this);
	            }
	            return this.paster;
	        }
	    }], [{
	        key: 'setSWF',
	        value: function setSWF(url) {
	            PickerCollector.setSWF(url);
	        }
	    }]);
	
	    return Core;
	})(Emitter);
	
	module.exports = Core;
	
	var Set = (function () {
	    function Set() {
	        _classCallCheck(this, Set);
	
	        this._set = [];
	    }
	
	    /**
	     * 项目总数
	     *
	     * @returns {Number}
	     */
	
	    _createClass(Set, [{
	        key: 'size',
	        value: function size() {
	            return this._set.length;
	        }
	
	        /**
	         * 从头部取出一项
	         *
	         * @returns {*}
	         */
	
	    }, {
	        key: 'shift',
	        value: function shift() {
	            return this._set.shift();
	        }
	
	        /**
	         * 从尾部取出一项
	         *
	         * @returns {*}
	         */
	
	    }, {
	        key: 'pop',
	        value: function pop() {
	            return this._set.pop();
	        }
	
	        /**
	         * 获得所有项
	         *
	         * @returns {Array}
	         */
	
	    }, {
	        key: 'toArray',
	        value: function toArray() {
	            return this._set.slice(0);
	        }
	
	        /**
	         * 添加一项
	         *
	         * @param item
	         * @returns {boolean} success if true
	         */
	
	    }, {
	        key: 'add',
	        value: function add(item) {
	            if (this.has(item)) {
	                return false;
	            }
	            this._set.push(item);
	            return true;
	        }
	
	        /**
	         * 是否存在该项
	         *
	         * @param item
	         * @returns {boolean}
	         */
	
	    }, {
	        key: 'has',
	        value: function has(item) {
	            return this._set.indexOf(item) > -1;
	        }
	
	        /**
	         * 删除某项
	         *
	         * @returns {boolean} success if true
	         */
	
	    }, {
	        key: 'remove',
	        value: function remove(item) {
	            var i = this._set.indexOf(item);
	            if (i > -1) {
	                this._set.splice(i, 1);
	                return true;
	            }
	            return false;
	        }
	
	        /**
	         * 清空
	         */
	
	    }, {
	        key: 'clear',
	        value: function clear() {
	            this._set = [];
	        }
	    }]);
	
	    return Set;
	})();
	
	var Stat = (function () {
	    function Stat() {
	        _classCallCheck(this, Stat);
	
	        this.files = new Set();
	    }
	
	    _createClass(Stat, [{
	        key: 'add',
	        value: function add(file) {
	            return this.files.add(file);
	        }
	    }, {
	        key: 'remove',
	        value: function remove(file) {
	            this.files.remove(file);
	        }
	    }, {
	        key: 'getTotal',
	        value: function getTotal() {
	            return this.files.size();
	        }
	    }, {
	        key: 'getFiles',
	        value: function getFiles(flag) {
	            var files = this.files.toArray();
	            if (!flag) {
	                return files;
	            }
	            return files.filter(function (file) {
	                return !!(file.getStatus() & flag);
	            });
	        }
	    }, {
	        key: 'stat',
	        value: function stat(flag) {
	            var ret = {},
	                files = this.getFiles(flag);
	
	            files.forEach(function (file) {
	                var status = file.getStatus();
	                ret[status] = status in ret ? ret[status] + 1 : 1;
	            });
	
	            ret['sum'] = files.length;
	
	            return ret;
	        }
	    }]);
	
	    return Stat;
	})();
	
	var Constraints = (function () {
	    function Constraints() {
	        _classCallCheck(this, Constraints);
	
	        this.constraints = new Set();
	    }
	
	    _createClass(Constraints, [{
	        key: 'add',
	        value: function add(constraint) {
	            this.constraints.add(constraint);
	            return this;
	        }
	    }, {
	        key: 'remove',
	        value: function remove(constraint) {
	            this.constraints.remove(constraint);
	            return this;
	        }
	    }, {
	        key: 'some',
	        value: function some() {
	            var _this4 = this;
	
	            return this.constraints.toArray().some(function (fn) {
	                return fn.call(_this4);
	            });
	        }
	    }]);
	
	    return Constraints;
	})();
	
	var Filters = (function () {
	    function Filters() {
	        _classCallCheck(this, Filters);
	
	        this.filters = new Set();
	    }
	
	    _createClass(Filters, [{
	        key: 'add',
	        value: function add(filter) {
	            this.filters.add(filter);
	            return this;
	        }
	    }, {
	        key: 'remove',
	        value: function remove(filter) {
	            this.filters.remove(filter);
	            return this;
	        }
	    }, {
	        key: 'filter',
	        value: function filter(file) {
	            var error = null;
	            this.filters.toArray().every(function (filter) {
	                var ret = undefined;
	                try {
	                    ret = filter(file);
	                } catch (e) {
	                    ret = e;
	                }
	                if (typeof ret === 'string') {
	                    error = new FilterError(file, ret);
	                    return false;
	                } else if (ret instanceof Error) {
	                    error = ret instanceof FilterError ? ret : new FilterError(file, ret.toString());
	                    return false;
	                }
	                return true;
	            });
	            return error;
	        }
	    }]);
	
	    return Filters;
	})();
	
	var Pending = (function () {
	    function Pending(threads) {
	        _classCallCheck(this, Pending);
	
	        this.threads = threads || 2;
	        this.heading = new Set();
	        this.pending = new Set();
	    }
	
	    _createClass(Pending, [{
	        key: 'add',
	        value: function add(file) {
	            var _this5 = this;
	
	            if (!this.pending.add(file)) return false;
	
	            file.session().always(function () {
	                return _this5.pending.remove(file);
	            });
	
	            this.load();
	
	            return true;
	        }
	    }, {
	        key: 'size',
	        value: function size() {
	            return this.pending.size() + this.heading.size();
	        }
	    }, {
	        key: 'process',
	        value: function process(file) {
	            var _this6 = this;
	
	            if (!this.heading.add(file)) return;
	
	            file.session().always(function () {
	                _this6.heading.remove(file);
	                _this6.load();
	            });
	        }
	    }, {
	        key: 'load',
	        value: function load() {
	            var file;
	            while (this.heading.size() < this.threads && (file = this.pending.shift())) {
	                if (file.prepare()) {
	                    this.process(file);
	                }
	            }
	        }
	    }]);
	
	    return Pending;
	})();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var Emitter = (function () {
	    function Emitter() {
	        _classCallCheck(this, Emitter);
	    }
	
	    _createClass(Emitter, [{
	        key: 'on',
	        value: function on(event, listener) {
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
	    }, {
	        key: 'once',
	        value: function once(event, listener) {
	            event = event.toLowerCase();
	
	            var that = this;
	
	            function fn() {
	                that.off(event, fn);
	                listener.apply(this, arguments);
	            }
	
	            fn.listener = listener;
	
	            this.on(event, fn);
	
	            return this;
	        }
	    }, {
	        key: 'off',
	        value: function off(event, listener) {
	            event = event.toLowerCase();
	
	            var listeners = undefined;
	
	            if (!this._events || !(listeners = this._events[event])) {
	                return this;
	            }
	
	            var i = listeners.length;
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
	    }, {
	        key: 'removeAllListeners',
	        value: function removeAllListeners(event) {
	            if (!event) {
	                this._events = [];
	            } else {
	                delete this._events[event.toLowerCase()];
	            }
	
	            return this;
	        }
	    }, {
	        key: 'setPropagationTarget',
	        value: function setPropagationTarget(emitter) {
	            if (emitter instanceof Emitter) {
	                this.propagationTarget = emitter;
	            }
	        }
	    }, {
	        key: 'emit',
	        value: function emit(event) {
	            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	                args[_key - 1] = arguments[_key];
	            }
	
	            this.applyEmit(event, args);
	        }
	    }, {
	        key: 'applyEmit',
	        value: function applyEmit(event, args) {
	            var _this = this;
	
	            event = event.toLowerCase();
	
	            var listeners = undefined;
	
	            if (this._events && (listeners = this._events[event])) {
	                listeners.slice(0).forEach(function (fn) {
	                    if (listeners.indexOf(fn) !== -1) {
	                        fn.apply(_this, args);
	                    }
	                });
	            }
	
	            if (this.propagationTarget) {
	                var pArgs = args.slice(0);
	                pArgs.unshift(this);
	                this.propagationTarget.applyEmit(event, pArgs);
	            }
	
	            return this;
	        }
	    }, {
	        key: 'invoke',
	        value: function invoke(event, data) {
	            event = event.toLowerCase();
	
	            var listeners = undefined;
	
	            if (!this._events || !(listeners = this._events[event])) {
	                listeners = [];
	            }
	
	            return HookInvoker(listeners.slice(0), data, this);
	        }
	    }]);
	
	    return Emitter;
	})();
	
	module.exports = Emitter;
	
	function HookInvoker(hooks, initialData, context) {
	    var _data = initialData;
	    var _error = null;
	    var _aborted = undefined;
	
	    var i = Deferred();
	    var ret = i.promise();
	
	    ret.abort = function () {
	        _aborted = true;
	    };
	
	    var fail = function fail(e) {
	        if (_aborted) return;
	        if (e) {
	            _error = e instanceof Error ? e : new Error(e);
	        }
	        i.reject(_error || new Error('Unknown'));
	    };
	
	    var done = function done() {
	        if (_aborted) return;
	        if (_error != null) {
	            fail();
	        } else {
	            i.resolve(_data);
	        }
	    };
	
	    var setData = function setData(data) {
	        if (data != null && (_data == null || data.constructor === _data.constructor)) {
	            _data = data;
	        }
	    };
	
	    var next = function next(data) {
	        if (_aborted) return;
	
	        if (data instanceof Error) {
	            _error = data;
	        }
	
	        if (_error != null) {
	            return fail();
	        }
	
	        setData(data);
	
	        var hook = hooks.shift();
	        if (!hook) {
	            return done();
	        }
	        var res = undefined;
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	exports.formatSize = function (size) {
	    size = parseFloat(size);
	    var prefixesSI = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
	        base = 1024;
	    var index = size ? Math.floor(Math.log(size) / Math.log(base)) : 0;
	    index = Math.min(index, prefixesSI.length - 1);
	    var powedPrecision = Math.pow(10, index < 2 ? 0 : index > 2 ? 2 : 1);
	    size = size / Math.pow(base, index);
	    size = Math.round(size * powedPrecision) / powedPrecision;
	    return size + prefixesSI[index] + 'B';
	};
	
	exports.parseSize = function (size) {
	    if (typeof size !== 'string') {
	        return size;
	    }
	
	    var units = {
	        t: 1099511627776,
	        g: 1073741824,
	        m: 1048576,
	        k: 1024
	    };
	
	    size = /^([0-9\.]+)([tgmk]?)b?$/i.exec(size);
	    var u = size[2];
	    size = +size[1];
	
	    if (units.hasOwnProperty(u)) {
	        size *= units[u];
	    }
	    return size;
	};
	
	var ACCEPTs = {
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
	
	    return extensions.toLowerCase().split(/ *[ ,;|+] */).map(function (ext) {
	        var m = /^\*?\.?(\w+)$/.exec(ext);
	        return m ? m[1] : null;
	    }).filter(function (ext) {
	        return ext !== null;
	    });
	}
	
	function normalizeAccept(accepts) {
	    if (!accepts) return null;
	
	    if (!Array.isArray(accepts)) {
	        accepts = [accepts];
	    }
	
	    return accepts.map(function (accept) {
	        if (typeof accept === 'string' && (accept = accept.toLowerCase()) && ACCEPTs.hasOwnProperty(accept)) {
	            return ACCEPTs[accept];
	        } else {
	            var extensions = normalizeExtensions(accept.extensions || accept);
	
	            return extensions.length ? {
	                title: accept.title || '',
	                extensions: extensions,
	                mimeTypes: accept.mimeTypes || ''
	            } : null;
	        }
	    }).filter(function (accept) {
	        return accept !== null;
	    });
	}
	
	exports.normalizeAccept = normalizeAccept;
	
	function createOptions(option) {
	    var options = {};
	    (option.match(/\S+/g) || []).forEach(function (flag) {
	        options[flag] = true;
	    });
	    return options;
	}
	
	function extend(target, source) {
	    for (var key in source) {
	        target[key] = source[key];
	    }
	    return target;
	}
	
	exports.extend = extend;
	
	function isFunction(obj) {
	    return typeof obj === 'function';
	}
	
	var ArrayFrom = Array.from || function (arrayLike) {
	    return [].slice.call(arrayLike);
	};
	
	function Callbacks(options) {
	    options = typeof options === "string" ? createOptions(options) : extend({}, options);
	
	    var firing = undefined,
	        memory = undefined,
	        _fired = undefined,
	        firingLength = undefined,
	        firingIndex = undefined,
	        firingStart = undefined,
	        list = [],
	        _this = undefined,
	        stack = !options.once && [],
	        fire = function fire(data) {
	        memory = options.memory && data;
	        _fired = true;
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
	        add: function add() {
	            if (list) {
	                var start = list.length;
	
	                (function add(args) {
	                    args.forEach(function (fn) {
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
	        remove: function remove() {
	            if (list) {
	                ArrayFrom(arguments).forEach(function (fn) {
	                    var i = list.length;
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
	        has: function has(fn) {
	            return fn ? list.indexOf(fn) > -1 : !!(list && list.length);
	        },
	        empty: function empty() {
	            list = [];
	            firingLength = 0;
	            return this;
	        },
	        disable: function disable() {
	            list = stack = memory = null;
	            return this;
	        },
	        disabled: function disabled() {
	            return !list;
	        },
	        lock: function lock() {
	            stack = null;
	            if (!memory) {
	                _this.disable();
	            }
	            return this;
	        },
	        locked: function locked() {
	            return !stack;
	        },
	        fireWith: function fireWith(context, args) {
	            if (list && (!_fired || stack)) {
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
	        fire: function fire() {
	            _this.fireWith(this, arguments);
	            return this;
	        },
	        fired: function fired() {
	            return !!_fired;
	        }
	    };
	
	    return _this;
	};
	
	function Deferred(func) {
	    var tuples = [["resolve", "done", Callbacks("once memory"), "resolved"], ["reject", "fail", Callbacks("once memory"), "rejected"], ["notify", "progress", Callbacks("memory")]],
	        _state = "pending",
	        _promise = {
	        state: function state() {
	            return _state;
	        },
	        always: function always() {
	            var args = ArrayFrom(arguments);
	            deferred.done(args).fail(args);
	            return this;
	        },
	        then: function then() /* fnDone, fnFail, fnProgress */{
	            var fns = arguments;
	            return Deferred(function (newDefer) {
	                tuples.forEach(function (tuple, i) {
	                    var fn = isFunction(fns[i]) && fns[i];
	                    deferred[tuple[1]](function () {
	                        var returned = fn && fn.apply(this, arguments);
	                        if (returned && isFunction(returned.promise)) {
	                            returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
	                        } else {
	                            newDefer[tuple[0] + "With"](this === _promise ? newDefer.promise() : this, fn ? [returned] : arguments);
	                        }
	                    });
	                });
	                fns = null;
	            }).promise();
	        },
	        promise: function promise(obj) {
	            return obj != null ? extend(obj, _promise) : _promise;
	        }
	    },
	        deferred = {};
	
	    _promise.pipe = _promise.then;
	
	    tuples.forEach(function (tuple, i) {
	        var list = tuple[2],
	            stateString = tuple[3];
	
	        _promise[tuple[1]] = list.add;
	
	        if (stateString) {
	            list.add(function () {
	                _state = stateString;
	            }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
	        }
	
	        deferred[tuple[0]] = function () {
	            deferred[tuple[0] + "With"](this === deferred ? _promise : this, arguments);
	            return this;
	        };
	
	        deferred[tuple[0] + "With"] = list.fireWith;
	    });
	
	    _promise.promise(deferred);
	
	    if (func) {
	        func.call(deferred, deferred);
	    }
	
	    return deferred;
	}
	
	exports.Deferred = Deferred;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	    QUEUE_UPLOAD_START: 'queueuploadstart', // 队列上传开始
	    QUEUE_UPLOAD_END: 'queueuploadend', // 队列上传结束
	    QUEUE_FILE_ADDED: 'queuefileadded', // 队列添加了一个文件
	    QUEUE_FILE_FILTERED: 'queuefilefiltered', // 队列过滤了一个文件
	    QUEUE_ERROR: 'queueerror', // 队列错误
	    QUEUE_STAT_CHANGE: 'statchange', // 统计发生变化
	
	    FILE_UPLOAD_START: 'fileuploadstart', // 文件上传开始
	    FILE_UPLOAD_PREPARING: 'fileuploadpreparing', // 文件上传准备时
	    FILE_UPLOAD_PREPARED: 'fileuploadprepared', // 文件上传准备好了
	    CHUNK_UPLOAD_PREPARING: 'chunkuploadpreparing', // 分块上传准备时
	    CHUNK_UPLOAD_COMPLETING: 'chunkuploadcompleting', // 分块上传结束时
	    FILE_UPLOAD_PROGRESS: 'fileuploadprogress', // 文件上传进度中
	    FILE_UPLOAD_END: 'fileuploadend', // 文件上传结束
	    FILE_UPLOAD_COMPLETING: 'fileuploadcompleting', // 文件上传结束时
	    FILE_UPLOAD_SUCCESS: 'fileuploadsuccess', // 文件上传成功
	    FILE_UPLOAD_ERROR: 'fileuploaderror', // 文件上传失败
	    FILE_UPLOAD_COMPLETED: 'fileuploadcompleted', // 文件上传完成了
	
	    FILE_CANCEL: 'filecancel', // 文件退出
	    FILE_STATUS_CHANGE: 'filestatuschange' // 文件状态发生变化
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	exports.Status = {
	    ALL: 255, // 所有状态
	
	    PROCESS: 31, // INITED -> END
	    INITED: 1, // 初始状态
	    QUEUED: 2, // 进入队列
	    PENDING: 4, // 队列中等待
	    PROGRESS: 8, // 上传中
	    END: 16, // 上传完成, 等待后续处理
	
	    SUCCESS: 32, // 上传成功
	    ERROR: 64, // 上传出错
	    CANCELLED: 128 // 上传取消 和 queued 相反, 退出队列
	};
	
	exports.StatusName = {
	    1: 'inited',
	    2: 'queued',
	    4: 'pending',
	    8: 'progress',
	    16: 'end',
	    32: 'success',
	    64: 'error',
	    128: 'cancelled'
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _Error = (function (_Error2) {
	    _inherits(_Error, _Error2);
	
	    function _Error(message) {
	        _classCallCheck(this, _Error);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_Error).call(this, message));
	
	        _this.message = message;
	        return _this;
	    }
	
	    return _Error;
	})(Error);
	
	var AbortError = (function (_Error3) {
	    _inherits(AbortError, _Error3);
	
	    function AbortError(message) {
	        _classCallCheck(this, AbortError);
	
	        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(AbortError).call(this, message));
	
	        _this2.name = 'AbortError';
	        return _this2;
	    }
	
	    return AbortError;
	})(_Error);
	
	var TimeoutError = (function (_Error4) {
	    _inherits(TimeoutError, _Error4);
	
	    function TimeoutError(message) {
	        _classCallCheck(this, TimeoutError);
	
	        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(TimeoutError).call(this, message));
	
	        _this3.name = 'TimeoutError';
	        return _this3;
	    }
	
	    return TimeoutError;
	})(_Error);
	
	var NetworkError = (function (_Error5) {
	    _inherits(NetworkError, _Error5);
	
	    function NetworkError(status, message) {
	        _classCallCheck(this, NetworkError);
	
	        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(NetworkError).call(this, message));
	
	        _this4.name = 'NetworkError';
	        _this4.status = status;
	        return _this4;
	    }
	
	    return NetworkError;
	})(_Error);
	
	var QueueLimitError = (function (_Error6) {
	    _inherits(QueueLimitError, _Error6);
	
	    function QueueLimitError() {
	        _classCallCheck(this, QueueLimitError);
	
	        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(QueueLimitError).call(this, 'queue limit'));
	
	        _this5.name = 'QueueLimitError';
	        return _this5;
	    }
	
	    return QueueLimitError;
	})(_Error);
	
	var FilterError = (function (_Error7) {
	    _inherits(FilterError, _Error7);
	
	    function FilterError(file, message) {
	        _classCallCheck(this, FilterError);
	
	        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(FilterError).call(this, message));
	
	        _this6.name = 'FilterError';
	        _this6.file = file;
	        return _this6;
	    }
	
	    return FilterError;
	})(_Error);
	
	var DuplicateError = (function (_FilterError) {
	    _inherits(DuplicateError, _FilterError);
	
	    function DuplicateError(file, message) {
	        _classCallCheck(this, DuplicateError);
	
	        var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(DuplicateError).call(this, file, message));
	
	        _this7.name = 'DuplicateError';
	        return _this7;
	    }
	
	    return DuplicateError;
	})(FilterError);
	
	var FileExtensionError = (function (_FilterError2) {
	    _inherits(FileExtensionError, _FilterError2);
	
	    function FileExtensionError(file, message) {
	        _classCallCheck(this, FileExtensionError);
	
	        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(FileExtensionError).call(this, file, message));
	
	        _this8.name = 'FileExtensionError';
	        return _this8;
	    }
	
	    return FileExtensionError;
	})(FilterError);
	
	var FileSizeError = (function (_FilterError3) {
	    _inherits(FileSizeError, _FilterError3);
	
	    function FileSizeError(file, message) {
	        _classCallCheck(this, FileSizeError);
	
	        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(FileSizeError).call(this, file, message));
	
	        _this9.name = 'FileSizeError';
	        return _this9;
	    }
	
	    return FileSizeError;
	})(FilterError);
	
	module.exports = { AbortError: AbortError, TimeoutError: TimeoutError, NetworkError: NetworkError,
	    QueueLimitError: QueueLimitError, FilterError: FilterError, DuplicateError: DuplicateError, FileExtensionError: FileExtensionError, FileSizeError: FileSizeError };

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _require = __webpack_require__(3);
	
	var parseSize = _require.parseSize;
	
	var ChunkResponse = (function () {
	    /**
	     * @param {string|null} rawResponse
	     * @param {ChunkRequest} chunkRequest
	     */
	
	    function ChunkResponse(rawResponse, chunkRequest) {
	        _classCallCheck(this, ChunkResponse);
	
	        this.rawResponse = rawResponse;
	        this.chunkRequest = chunkRequest;
	    }
	
	    _createClass(ChunkResponse, [{
	        key: 'getChunkRequest',
	        value: function getChunkRequest() {
	            return this.chunkRequest;
	        }
	    }, {
	        key: 'getRawResponse',
	        value: function getRawResponse() {
	            return this.rawResponse;
	        }
	    }, {
	        key: 'getResponse',
	        value: function getResponse() {
	            return this.response || this.rawResponse;
	        }
	    }, {
	        key: 'getJson',
	        value: function getJson() {
	            var response = this.getResponse();
	            if (response == null) {
	                return null;
	            }
	            if (typeof response.getJson === 'function') {
	                return response.getJson();
	            }
	            if (typeof response === 'string') {
	                return response === '' ? null : JSON.parse(response);
	            }
	            return response;
	        }
	    }, {
	        key: 'setResponse',
	        value: function setResponse(response) {
	            this.response = response;
	            return this;
	        }
	    }]);
	
	    return ChunkResponse;
	})();
	
	var ChunkRequest = (function () {
	    /**
	     *
	     * @param {int} index
	     * @param {Blob} blob
	     * @param {FileRequest} fileRequest
	     */
	
	    function ChunkRequest(index, blob, fileRequest) {
	        _classCallCheck(this, ChunkRequest);
	
	        this.index = index || 0;
	        this.fileRequest = fileRequest;
	        this.blob = blob || fileRequest.getFile().source;
	    }
	
	    _createClass(ChunkRequest, [{
	        key: 'getName',
	        value: function getName() {
	            return this.fileRequest.getName();
	        }
	    }, {
	        key: 'getFile',
	        value: function getFile() {
	            return this.fileRequest.getFile();
	        }
	    }, {
	        key: 'getBlob',
	        value: function getBlob() {
	            return this.blob;
	        }
	    }, {
	        key: 'getBlobName',
	        value: function getBlobName() {
	            return this.isMultiChunk() ? this.blob.name || 'blob' : this.getFile().name;
	        }
	    }, {
	        key: 'getIndex',
	        value: function getIndex() {
	            return this.index;
	        }
	    }, {
	        key: 'isMultiChunk',
	        value: function isMultiChunk() {
	            return this.getFile().source !== this.blob;
	        }
	    }, {
	        key: 'getParams',
	        value: function getParams() {
	            if (!this.params) {
	                this.params = this.fileRequest.getParams().clone();
	            }
	            return this.params;
	        }
	    }, {
	        key: 'getParam',
	        value: function getParam(name) {
	            return this.getParams().getParam(name);
	        }
	    }, {
	        key: 'setParam',
	        value: function setParam(name, value) {
	            this.getParams().setParam(name, value);
	
	            return this;
	        }
	    }, {
	        key: 'getFileRequest',
	        value: function getFileRequest() {
	            return this.fileRequest;
	        }
	    }, {
	        key: 'getUrl',
	        value: function getUrl() {
	            return this.url || this.fileRequest.getUrl();
	        }
	    }, {
	        key: 'setUrl',
	        value: function setUrl(url) {
	            this.url = url;
	            return this;
	        }
	    }, {
	        key: 'getHeaders',
	        value: function getHeaders() {
	            if (!this.headers) {
	                this.headers = this.fileRequest.getHeaders().slice(0);
	            }
	            return this.headers;
	        }
	    }, {
	        key: 'setHeader',
	        value: function setHeader(name, value) {
	            var headers = this.getHeaders();
	            headers.push({ name: name, value: value });
	            return this;
	        }
	    }, {
	        key: 'isWithCredentials',
	        value: function isWithCredentials() {
	            return this.fileRequest.isWithCredentials();
	        }
	    }, {
	        key: 'getTimeout',
	        value: function getTimeout() {
	            return this.fileRequest.getTimeout();
	        }
	    }, {
	        key: 'createChunkResponse',
	        value: function createChunkResponse(response) {
	            return new ChunkResponse(response, this);
	        }
	    }]);
	
	    return ChunkRequest;
	})();
	
	var FileResponse = (function () {
	    /**
	     * @param {ChunkResponse|Object|string} rawResponse
	     * @param {FileRequest} fileRequest
	     */
	
	    function FileResponse(rawResponse, fileRequest) {
	        _classCallCheck(this, FileResponse);
	
	        this.rawResponse = rawResponse;
	        this.fileRequest = fileRequest;
	    }
	
	    _createClass(FileResponse, [{
	        key: 'isFromMultiChunkResponse',
	        value: function isFromMultiChunkResponse() {
	            if (this.rawResponse instanceof ChunkResponse) {
	                return this.rawResponse.getChunkRequest().isMultiChunk();
	            }
	            return false;
	        }
	    }, {
	        key: 'getFileRequest',
	        value: function getFileRequest() {
	            return this.fileRequest;
	        }
	    }, {
	        key: 'getRawResponse',
	        value: function getRawResponse() {
	            return this.rawResponse;
	        }
	    }, {
	        key: 'getResponse',
	        value: function getResponse() {
	            if (this.response != null) {
	                return this.response;
	            }
	            if (this.rawResponse instanceof ChunkResponse) {
	                return this.rawResponse.getResponse();
	            } else {
	                return this.rawResponse;
	            }
	        }
	    }, {
	        key: 'getJson',
	        value: function getJson() {
	            var response = this.getResponse();
	            if (response == null) {
	                return null;
	            }
	            if (typeof response.getJson === 'function') {
	                return response.getJson();
	            }
	            if (typeof response === 'string') {
	                return response === '' ? null : JSON.parse(response);
	            }
	            return response;
	        }
	    }, {
	        key: 'setResponse',
	        value: function setResponse(response) {
	            this.response = response;
	            return this;
	        }
	    }]);
	
	    return FileResponse;
	})();
	
	var Params = (function () {
	    function Params(params) {
	        _classCallCheck(this, Params);
	
	        if (Array.isArray(params)) {
	            this.params = params.slice(0);
	        } else if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === 'object') {
	            this.params = [];
	            for (var name in params) {
	                if (params.hasOwnProperty(name)) {
	                    this.params.push({ name: name, value: params[name] });
	                }
	            }
	        } else {
	            this.params = [];
	        }
	    }
	
	    _createClass(Params, [{
	        key: 'setParam',
	        value: function setParam(name, value) {
	            this.removeParam(name);
	            this.addParam(name, value);
	        }
	    }, {
	        key: 'addParam',
	        value: function addParam(name, value) {
	            this.params.push({ name: name, value: value });
	        }
	    }, {
	        key: 'removeParam',
	        value: function removeParam(name) {
	            this.params = this.params.filter(function (param) {
	                return param.name !== name;
	            });
	        }
	    }, {
	        key: 'getParam',
	        value: function getParam(name, single) {
	            var ret = this.params.filter(function (param) {
	                return param.name === name;
	            }).map(function (param) {
	                return param.value;
	            });
	
	            if (single) {
	                return ret.shift();
	            }
	
	            return ret;
	        }
	    }, {
	        key: 'clone',
	        value: function clone() {
	            return new Params(this.params);
	        }
	    }, {
	        key: 'toArray',
	        value: function toArray() {
	            return this.params;
	        }
	    }, {
	        key: 'toString',
	        value: function toString() {
	            var params = this.params.map(function (param) {
	                return encodeURIComponent(param.name) + '=' + (param.value == null ? '' : encodeURIComponent(param.value));
	            });
	
	            return params.join('&'); //.replace( /%20/g, '+');
	        }
	    }]);
	
	    return Params;
	})();
	
	var MIN_CHUNK_SIZE = 256 * 1024; // 256K
	
	var FileRequest = (function () {
	    function FileRequest(file) {
	        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	        _classCallCheck(this, FileRequest);
	
	        this.file = file;
	        this.name = options.name || 'file';
	        this.url = options.url || options.action;
	        this.params = new Params(options.params || options.data);
	        this.headers = options.headers || [];
	        this.withCredentials = options.withCredentials;
	        this.timeout = options.timeout || 0;
	        this.chunkSize = options.chunkSize || 0;
	        this.chunkRetries = options.chunkRetries || 0;
	        this.chunkEnable = options.chunkEnable || false;
	        this.chunkProcessThreads = options.chunkProcessThreads || 2;
	    }
	
	    _createClass(FileRequest, [{
	        key: 'getFile',
	        value: function getFile() {
	            return this.file;
	        }
	    }, {
	        key: 'getUrl',
	        value: function getUrl() {
	            return this.url || '';
	        }
	    }, {
	        key: 'getName',
	        value: function getName() {
	            return this.name;
	        }
	    }, {
	        key: 'setName',
	        value: function setName(name) {
	            this.name = name;
	            return this;
	        }
	    }, {
	        key: 'setUrl',
	        value: function setUrl(url) {
	            this.url = url;
	            return this;
	        }
	    }, {
	        key: 'getParams',
	        value: function getParams() {
	            return this.params;
	        }
	    }, {
	        key: 'getParam',
	        value: function getParam(name) {
	            return this.getParams().getParam(name);
	        }
	    }, {
	        key: 'setParam',
	        value: function setParam(name, value) {
	            this.params.setParam(name, value);
	            return this;
	        }
	    }, {
	        key: 'getHeaders',
	        value: function getHeaders() {
	            return this.headers;
	        }
	    }, {
	        key: 'setHeader',
	        value: function setHeader(name, value) {
	            this.headers.push({ name: name, value: value });
	        }
	    }, {
	        key: 'isWithCredentials',
	        value: function isWithCredentials() {
	            return this.withCredentials;
	        }
	    }, {
	        key: 'setWithCredentials',
	        value: function setWithCredentials(flag) {
	            this.withCredentials = flag;
	            return this;
	        }
	    }, {
	        key: 'getTimeout',
	        value: function getTimeout() {
	            return this.timeout;
	        }
	    }, {
	        key: 'setTimeout',
	        value: function setTimeout(timeout) {
	            this.timeout = timeout;
	            return this;
	        }
	    }, {
	        key: 'getChunkSize',
	        value: function getChunkSize() {
	            return parseSize(this.chunkSize);
	        }
	    }, {
	        key: 'setChunkSize',
	        value: function setChunkSize(chunkSize) {
	            this.chunkSize = chunkSize;
	            return this;
	        }
	    }, {
	        key: 'getChunkRetries',
	        value: function getChunkRetries() {
	            return this.chunkRetries;
	        }
	    }, {
	        key: 'setChunkRetries',
	        value: function setChunkRetries(retries) {
	            this.chunkRetries = retries;
	            return 0;
	        }
	    }, {
	        key: 'isChunkEnable',
	        value: function isChunkEnable() {
	            var chunkSize = this.getChunkSize();
	            return this.chunkEnable && chunkSize > MIN_CHUNK_SIZE && this.file.getRuntime().canSlice() && this.file.size > chunkSize;
	        }
	    }, {
	        key: 'setChunkEnable',
	        value: function setChunkEnable(flag) {
	            this.chunkEnable = flag;
	            return this;
	        }
	    }, {
	        key: 'getChunkProcessThreads',
	        value: function getChunkProcessThreads() {
	            return this.chunkProcessThreads;
	        }
	    }, {
	        key: 'setChunkProcessThreads',
	        value: function setChunkProcessThreads(threads) {
	            this.chunkProcessThreads = threads;
	            return this;
	        }
	    }, {
	        key: 'createChunkRequest',
	        value: function createChunkRequest(index, blob) {
	            return new ChunkRequest(index, blob, this);
	        }
	    }, {
	        key: 'createFileResponse',
	        value: function createFileResponse(response) {
	            return new FileResponse(response, this);
	        }
	    }]);
	
	    return FileRequest;
	})();
	
	module.exports = FileRequest;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Emitter = __webpack_require__(2);
	var Runtime = __webpack_require__(9);
	var File = __webpack_require__(12);
	
	var MAX_NUM_ONCE = 100;
	
	function createReader(collector) {
	    return function (dataTransfer, responders) {
	        var items = dataTransfer.items,
	            files = dataTransfer.files;
	        var item = undefined,
	            times = MAX_NUM_ONCE;
	        var _break = false;
	
	        function collect(file) {
	            if (--times < 0 || !collector(file, responders)) {
	                _break = true;
	                return false;
	            }
	            return true;
	        }
	
	        function readEntry(entry) {
	            if (_break) return;
	            if (entry.isFile) {
	                entry.file(function (file) {
	                    if (!_break) {
	                        collect(file);
	                    }
	                });
	            } else if (entry.isDirectory) {
	                entry.createReader().readEntries(function (entries) {
	                    if (_break) return;
	                    for (var i = 0, l = entries.length; i < l; i++) {
	                        if (_break) break;
	                        readEntry(entries[i]);
	                    }
	                });
	            }
	        }
	
	        for (var i = 0, l = files.length; i < l; i++) {
	            if (_break) break;
	            item = items && items[i];
	
	            var entry = item && item.webkitGetAsEntry && item.webkitGetAsEntry();
	
	            if (entry && entry.isDirectory) {
	                readEntry(entry);
	            } else {
	                if (!collect(files[i])) {
	                    break;
	                }
	            }
	        }
	    };
	}
	
	var Area = (function (_Emitter) {
	    _inherits(Area, _Emitter);
	
	    function Area(area) {
	        _classCallCheck(this, Area);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Area).call(this));
	
	        _this.areaElement = area;
	        return _this;
	    }
	
	    _createClass(Area, [{
	        key: 'contains',
	        value: function contains(target) {
	            return this.areaElement.contains(target);
	        }
	    }, {
	        key: 'start',
	        value: function start(e, allowed) {
	            this.emit('start', e, allowed);
	        }
	    }, {
	        key: 'response',
	        value: function response(e, allowed) {
	            allowed = allowed && this.contains(e.target);
	            this.emit('response', e, allowed);
	            return allowed;
	        }
	    }, {
	        key: 'end',
	        value: function end(e) {
	            this.emit('end', e);
	        }
	    }]);
	
	    return Area;
	})(Emitter);
	
	var Collectors = [];
	
	function prepare() {
	    if (!('DataTransfer' in window) || !('FileList' in window) || !document.addEventListener) {
	        return;
	    }
	
	    var runtime = Runtime.getInstance();
	
	    var started = 0,
	        enter = 0,
	        endTimer = undefined;
	    var dataTransferReader = createReader(function (file, responders) {
	        if (!responders || responders.length < 1) {
	            return false;
	        }
	        file = new File(runtime, file);
	        var total = responders.length;
	        return responders.some(function (responder) {
	            var ret = responder.recieve(file);
	            if (ret > 0) {
	                return true;
	            }
	            if (ret < 0) {
	                total -= 1;
	            }
	            return false;
	        }) || total > 0;
	    });
	
	    var start = function start(e) {
	        started = 1;
	        Collectors.forEach(function (responder) {
	            return responder.start(e);
	        });
	    };
	
	    var move = function move(e) {
	        var has = Collectors.filter(function (responder) {
	            return responder.response(e);
	        }).length > 0;
	
	        var dataTransfer = e.dataTransfer;
	
	        if (dataTransfer) {
	            dataTransfer.dropEffect = has ? 'copy' : 'none';
	        }
	        e.preventDefault();
	    };
	
	    var end = function end(e) {
	        started = 0;
	        enter = 0;
	        Collectors.forEach(function (responder) {
	            return responder.end(e);
	        });
	    };
	
	    var drag = function drag(e) {
	        clearTimeout(endTimer);
	        var isLeave = e.type === 'dragleave';
	        if (!isLeave && !started) {
	            start(e);
	        }
	        move(e);
	        if (isLeave) {
	            endTimer = setTimeout(function () {
	                return end(e);
	            }, 100);
	        }
	    };
	    var drop = function drop(e) {
	        e.preventDefault();
	
	        clearTimeout(endTimer);
	        end(e);
	
	        var responders = Collectors.filter(function (responder) {
	            return responder.contains(e.target);
	        });
	
	        if (responders.length < 1) {
	            return;
	        }
	
	        var dataTransfer = e.dataTransfer;
	
	        try {
	            if (dataTransfer.getData('text/html')) {
	                return;
	            }
	        } catch (ex) {}
	
	        dataTransferReader(dataTransfer, responders);
	    };
	
	    document.addEventListener('dragenter', drag, false);
	    document.addEventListener('dragover', drag, false);
	    document.addEventListener('dragleave', drag, false);
	    document.addEventListener('drop', drop, false);
	}
	
	var DndCollector = (function () {
	    function DndCollector(core) {
	        _classCallCheck(this, DndCollector);
	
	        if (Collectors.length < 1) {
	            prepare();
	        }
	        Collectors.push(this);
	
	        this.core = core;
	        this.areas = [];
	    }
	
	    _createClass(DndCollector, [{
	        key: 'addArea',
	        value: function addArea(area) {
	            var _this2 = this;
	
	            area = new Area(area);
	            this.areas.push(area);
	            area.destroy = function () {
	                area.removeAllListeners();
	                var i = _this2.areas.indexOf(area);
	                if (i > -1) {
	                    _this2.areas.splice(i, 1);
	                }
	            };
	
	            return area;
	        }
	    }, {
	        key: 'contains',
	        value: function contains(target) {
	            return this.areas.some(function (area) {
	                return area.contains(target);
	            });
	        }
	    }, {
	        key: 'start',
	        value: function start(e) {
	            this.areas.forEach(function (area) {
	                return area.start(e);
	            });
	        }
	    }, {
	        key: 'response',
	        value: function response(e) {
	            return this.areas.map(function (area) {
	                return area.response(e);
	            }).some(function (r) {
	                return r !== false;
	            });
	        }
	    }, {
	        key: 'recieve',
	        value: function recieve(file) {
	            var ret = this.core.add(file);
	            if (ret > 0 && !this.core.isMultiple()) {
	                return -1;
	            } else {
	                return ret;
	            }
	        }
	    }, {
	        key: 'end',
	        value: function end(e) {
	            this.areas.forEach(function (area) {
	                return area.end(e);
	            });
	        }
	    }]);
	
	    return DndCollector;
	})();
	
	module.exports = DndCollector;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Runtime = __webpack_require__(10);
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var Transport = __webpack_require__(11);
	
	var instance = undefined;
	
	var Html5Runtime = (function (_Runtime) {
	    _inherits(Html5Runtime, _Runtime);
	
	    function Html5Runtime() {
	        _classCallCheck(this, Html5Runtime);
	
	        return _possibleConstructorReturn(this, Object.getPrototypeOf(Html5Runtime).apply(this, arguments));
	    }
	
	    _createClass(Html5Runtime, [{
	        key: 'getAsDataUrl',
	        value: function getAsDataUrl(blob, timeout) {
	            var i = Deferred(),
	                fr = new FileReader(),
	                timer = undefined;
	
	            fr.onloadend = function () {
	                if (fr.readyState == FileReader.DONE) {
	                    i.resolve(fr.result);
	                } else {
	                    i.reject();
	                }
	                clearTimeout(timer);
	                fr.onloadend = null;
	            };
	            fr.readAsDataURL(blob);
	
	            var abort = function abort() {
	                fr && fr.abort();
	                fr = null;
	            };
	            if (timeout) {
	                timer = setTimeout(abort, timeout);
	            }
	
	            var ret = i.promise();
	            ret.abort = abort;
	
	            return ret;
	        }
	    }, {
	        key: 'getTransport',
	        value: function getTransport() {
	            if (!this.transport) {
	                this.transport = new Transport(this);
	            }
	            return this.transport;
	        }
	    }, {
	        key: 'canSlice',
	        value: function canSlice() {
	            return !!(Blob.prototype.slice || Blob.prototype.mozSlice || Blob.prototype.webkitSlice);
	        }
	    }, {
	        key: 'slice',
	        value: function slice(blob, start, end) {
	            var blobSlice = blob.slice || blob.mozSlice || blob.webkitSlice;
	
	            return blobSlice.call(blob, start, end);
	        }
	    }, {
	        key: 'md5',
	        value: function md5(blob) {
	            var i = Deferred();
	
	            if (!window.SparkMD5) {
	                i.reject();
	                return i.promise();
	            }
	
	            var chunkSize = 2 * 1024 * 1024,
	                chunks = Math.ceil(blob.size / chunkSize),
	                chunk = 0,
	                spark = new SparkMD5.ArrayBuffer(),
	                blobSlice = blob.mozSlice || blob.webkitSlice || blob.slice;
	
	            var fr = new FileReader();
	
	            var _loadNext = function loadNext() {
	                if (!fr) return;
	                var start = undefined,
	                    end = undefined;
	
	                start = chunk * chunkSize;
	                end = Math.min(start + chunkSize, blob.size);
	
	                fr.onload = function () {
	                    spark && spark.append(fr.result);
	                };
	
	                fr.onloadend = function () {
	                    if (!fr) return;
	                    if (fr.readyState == FileReader.DONE) {
	                        if (++chunk < chunks) {
	                            setTimeout(_loadNext, 1);
	                        } else {
	                            setTimeout(function () {
	                                spark && i.resolve(spark.end());
	                                _loadNext = blob = spark = null;
	                            }, 50);
	                        }
	                    } else {
	                        i.reject();
	                    }
	                    fr.onloadend = fr.onload = null;
	                };
	
	                fr.readAsArrayBuffer(blobSlice.call(blob, start, end));
	            };
	
	            _loadNext();
	
	            var ret = i.promise();
	            ret.abort = function () {
	                fr && fr.abort();
	                spark = null;
	                fr = null;
	            };
	
	            return ret;
	        }
	    }], [{
	        key: 'getInstance',
	        value: function getInstance() {
	            if (!instance) {
	                instance = new Html5Runtime();
	            }
	            return instance;
	        }
	    }]);
	
	    return Html5Runtime;
	})(Runtime);
	
	module.exports = Html5Runtime;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Emitter = __webpack_require__(2);
	var Events = __webpack_require__(4);
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var _require2 = __webpack_require__(6);
	
	var NetworkError = _require2.NetworkError;
	
	var Runtime = (function (_Emitter) {
	    _inherits(Runtime, _Emitter);
	
	    function Runtime() {
	        _classCallCheck(this, Runtime);
	
	        return _possibleConstructorReturn(this, Object.getPrototypeOf(Runtime).apply(this, arguments));
	    }
	
	    _createClass(Runtime, [{
	        key: 'md5',
	        value: function md5(blob) {
	            var i = Deferred();
	            i.reject();
	            return i.promise();
	        }
	    }, {
	        key: 'getAsDataUrl',
	        value: function getAsDataUrl(file, timeout) {
	            var i = Deferred();
	            i.reject();
	            return i.promise();
	        }
	    }, {
	        key: 'getTransport',
	        value: function getTransport() {
	            return null;
	        }
	    }, {
	        key: 'getUploading',
	        value: function getUploading() {
	            if (!this.uploading) {
	                this.uploading = new Uploading(this);
	            }
	            return this.uploading;
	        }
	    }, {
	        key: 'canSlice',
	        value: function canSlice() {
	            return false;
	        }
	    }, {
	        key: 'slice',
	        value: function slice(blob) {
	            throw new Error('this runtime current not support slice');
	        }
	    }, {
	        key: 'cancel',
	        value: function cancel(blob) {}
	    }]);
	
	    return Runtime;
	})(Emitter);
	
	module.exports = Runtime;
	
	var Uploading = (function () {
	    function Uploading(runtime) {
	        _classCallCheck(this, Uploading);
	
	        this.runtime = runtime;
	    }
	
	    /**
	     * @param {FileRequest} request
	     * @returns {*}
	     */
	
	    _createClass(Uploading, [{
	        key: 'generate',
	        value: function generate(request) {
	            var _this2 = this;
	
	            var i = Deferred(),
	                file = request.getFile(),
	                runtime = this.runtime;
	
	            var source = file.getSource(),
	                size = file.size,
	                chunkSize = request.getChunkSize(),
	                useChunk = request.isChunkEnable(),
	                threads = Math.max(request.getChunkProcessThreads(), 1),
	                start = 0,
	                end = 0,
	                slots = [];
	
	            var getActives = function getActives() {
	                return slots.reduce(function (sum, slot) {
	                    return sum + (slot.state() === 'pending' ? 1 : 0);
	                }, 0);
	            };
	
	            var readChunk = function readChunk() {
	                var slot = undefined,
	                    req = undefined,
	                    blob = undefined;
	                while (end < size && getActives() < threads) {
	                    start = end;
	                    end = Math.min(end + chunkSize, size);
	                    blob = runtime.slice(source, start, end);
	                    req = request.createChunkRequest(slots.length, blob);
	                    req.setHeader('Content-Range', 'bytes ' + start + '-' + (end - 1) + '/' + size);
	                    slot = _this2.slot(req, request.getChunkRetries());
	                    slot.progress(progress).done(done).fail(fail);
	                    slots.push(slot);
	                }
	            };
	
	            var progress = function progress() {
	                var total = size - end,
	                    loaded = 0;
	                slots.forEach(function (slot) {
	                    total += slot.total;
	                    loaded += slot.loaded;
	                });
	                i.notify({ total: total, loaded: loaded });
	            };
	
	            var done = function done(res) {
	                useChunk && readChunk();
	
	                if (end >= size && slots.every(function (slot) {
	                    return slot.state() === 'resolved';
	                })) {
	                    i.resolve(res);
	                }
	            };
	
	            var abort = function abort() {
	                slots.forEach(function (slot) {
	                    return slot.abort();
	                });
	            };
	
	            var fail = function fail(error) {
	                i.reject(error);
	                abort();
	            };
	
	            if (useChunk) {
	                readChunk();
	            } else {
	                end = size;
	                var slot = this.slot(request.createChunkRequest(), 0);
	                slot.progress(progress).done(done).fail(fail);
	                slots.push(slot);
	            }
	
	            var ret = i.promise();
	            ret.abort = abort;
	
	            return ret;
	        }
	    }, {
	        key: 'slot',
	        value: function slot(request, retries) {
	            var i = Deferred(),
	                runtime = this.runtime,
	                core = request.getFile().getCore();
	
	            var ret = i.promise();
	
	            var progress = function progress(e) {
	                if (e.total) {
	                    ret.total = e.total;
	                }
	                if (e.loaded) {
	                    ret.loaded = e.loaded;
	                }
	                i.notify(e);
	            };
	
	            var process = function process() {
	                var prepare, transport, completion;
	                ret.abort = function () {
	                    prepare && prepare.abort();
	                    transport && transport.abort();
	                    completion && completion.abort();
	                };
	                ret.total = request.getBlob().size;
	                ret.loaded = 0;
	
	                prepare = core.invoke(Events.CHUNK_UPLOAD_PREPARING, request);
	
	                prepare.then(function (request) {
	                    transport = runtime.getTransport().generate(request);
	                    transport.progress(progress);
	                    return transport;
	                }).then(function (response) {
	                    completion = core.invoke(Events.CHUNK_UPLOAD_COMPLETING, request.createChunkResponse(response));
	                    return completion;
	                }).done(i.resolve).fail(error);
	            };
	
	            var error = function error(e) {
	                if (e instanceof NetworkError && retries-- > 0) {
	                    // retry
	                    setTimeout(process, 500);
	                } else {
	                    i.reject(e);
	                }
	                ret.abort();
	            };
	
	            process();
	
	            return ret;
	        }
	    }]);
	
	    return Uploading;
	})();

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var _require2 = __webpack_require__(6);
	
	var TimeoutError = _require2.TimeoutError;
	var AbortError = _require2.AbortError;
	var NetworkError = _require2.NetworkError;
	
	var Html5Transport = (function () {
	    function Html5Transport() {
	        _classCallCheck(this, Html5Transport);
	    }
	
	    _createClass(Html5Transport, [{
	        key: 'generate',
	
	        /**
	         * @param {ChunkRequest} request
	         * @returns {*}
	         */
	        value: function generate(request) {
	            var i = Deferred();
	            var xhr = new XMLHttpRequest();
	
	            var timeoutTimer = undefined;
	
	            var clean = function clean() {
	                xhr.onload = xhr.onerror = null;
	                if (xhr.upload) {
	                    xhr.upload.onprogress = null;
	                }
	                if (timeoutTimer) {
	                    clearTimeout(timeoutTimer);
	                }
	            };
	
	            var abort = function abort() {
	                clean();
	                try {
	                    xhr.abort();
	                } catch (e) {}
	            };
	
	            var complete = function complete(e) {
	                clean();
	                if (!xhr.status && e.type === 'error') {
	                    return i.reject(new AbortError(e.message));
	                }
	                if (xhr.status === 0 || xhr.status === 304 || xhr.status >= 200 && xhr.status < 300) {
	                    return i.resolve(xhr.responseText);
	                }
	                return i.reject(new NetworkError(xhr.status, xhr.statusText));
	            };
	
	            if (xhr.upload) {
	                xhr.upload.onprogress = function (e) {
	                    return i.notify(e);
	                };
	            }
	            xhr.onerror = complete;
	            xhr.onload = complete;
	
	            // Timeout
	            var timeout = request.getTimeout();
	            if (timeout > 0) {
	                timeoutTimer = setTimeout(function () {
	                    abort();
	                    i.reject(new TimeoutError('timeout:' + timeout));
	                }, timeout);
	            }
	
	            try {
	                (function () {
	                    xhr.open('POST', request.getUrl(), true);
	                    if (request.isWithCredentials()) {
	                        xhr.withCredentials = true;
	                    }
	
	                    request.getHeaders().forEach(function (header) {
	                        return xhr.setRequestHeader(header.name, header.value);
	                    });
	
	                    var formData = new FormData();
	
	                    request.getParams().toArray().forEach(function (param) {
	                        return formData.append(param.name, param.value);
	                    });
	
	                    formData.append(request.getName(), request.getBlob(), request.getBlobName());
	
	                    xhr.send(formData);
	                })();
	            } catch (e) {
	                abort();
	                i.reject(new AbortError(e.message));
	            }
	
	            var ret = i.promise();
	            ret.abort = abort;
	
	            return ret;
	        }
	    }]);
	
	    return Html5Transport;
	})();
	
	module.exports = Html5Transport;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Emitter = __webpack_require__(2);
	var Events = __webpack_require__(4);
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var _require2 = __webpack_require__(5);
	
	var Status = _require2.Status;
	var StatusName = _require2.StatusName;
	
	var uid = 0;
	function guid() {
	    return 'FILE-' + (uid++).toString(16).toUpperCase();
	}
	
	var RE_EXT = /\.([^.]+)$/,
	    RE_IMAGE = /^image\/(jpg|jpeg|png|gif|bmp|webp)$/i;
	function guessExt(blob) {
	    var m = blob.name && RE_EXT.exec(blob.name);
	    if (m) {
	        return m[1];
	    }
	    m = blob.type && RE_IMAGE.exec(blob.type);
	    if (m) {
	        return m[1];
	    }
	    return '';
	}
	
	function guessType(ext) {
	    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].indexOf(ext.toLowerCase()) > -1) {
	        return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
	    }
	    return null;
	}
	
	var Progress = (function () {
	    function Progress(total, loaded) {
	        _classCallCheck(this, Progress);
	
	        this.change(total, loaded);
	    }
	
	    _createClass(Progress, [{
	        key: 'change',
	        value: function change(total, loaded) {
	            this.total = total;
	            this.loaded = loaded || 0;
	            this.percentage = this.loaded === this.total ? 100 : Math.ceil(this.loaded / this.total * 100);
	        }
	    }, {
	        key: 'done',
	        value: function done() {
	            this.change(this.total, this.total);
	        }
	    }]);
	
	    return Progress;
	})();
	
	var File = (function (_Emitter) {
	    _inherits(File, _Emitter);
	
	    function File(runtime, source, filename) {
	        _classCallCheck(this, File);
	
	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(File).call(this));
	
	        _this.id = guid();
	
	        _this.name = source.name || filename || _this.id;
	
	        var ext = guessExt(source).toLowerCase();
	
	        if (ext && !RE_EXT.test(_this.name)) {
	            _this.name += '.' + ext;
	        }
	
	        _this.ext = ext;
	
	        _this.type = source.type || guessType(_this.ext) || 'application/octet-stream';
	
	        _this.lastModified = source.lastModified || +new Date();
	
	        _this.size = source.size || 0;
	
	        _this.runtime = runtime;
	
	        _this.source = source;
	
	        _this.status = Status.INITED;
	
	        _this.progress = new Progress(_this.size, 0);
	        return _this;
	    }
	
	    _createClass(File, [{
	        key: 'getCore',
	        value: function getCore() {
	            return this.core;
	        }
	    }, {
	        key: 'setCore',
	        value: function setCore(core) {
	            this.core = core;
	            this.setPropagationTarget(core);
	        }
	    }, {
	        key: 'getRuntime',
	        value: function getRuntime() {
	            return this.runtime;
	        }
	    }, {
	        key: 'isImage',
	        value: function isImage() {
	            return RE_IMAGE.test(this.type);
	        }
	    }, {
	        key: 'setStatus',
	        value: function setStatus(status, silent) {
	            var prevStatus = this.status;
	
	            if (prevStatus !== Status.CANCELLED && status !== prevStatus) {
	                this.status = status;
	                !silent && this.emit(Events.FILE_STATUS_CHANGE, status, prevStatus);
	            }
	        }
	    }, {
	        key: 'getStatus',
	        value: function getStatus() {
	            return this.status;
	        }
	    }, {
	        key: 'getStatusName',
	        value: function getStatusName() {
	            if (this.status in StatusName) {
	                return StatusName[this.status];
	            } else {
	                return 'unknow';
	            }
	        }
	    }, {
	        key: 'getSource',
	        value: function getSource() {
	            return this.source;
	        }
	    }, {
	        key: 'getAsDataUrl',
	        value: function getAsDataUrl(timeout) {
	            if (!this._dataUrlPromise) {
	                this._dataUrlPromise = this.runtime.getAsDataUrl(this.source, timeout);
	            }
	            return this._dataUrlPromise;
	        }
	    }, {
	        key: 'md5',
	        value: function md5() {
	            if (!this._md5Promise) {
	                this._md5Promise = this.runtime.md5(this.source);
	            }
	            return this._md5Promise;
	        }
	    }, {
	        key: 'session',
	        value: function session() {
	            var _this2 = this;
	
	            if (this._sessionPromise) {
	                return this._sessionPromise;
	            }
	
	            var ret = Deferred();
	
	            ret.progress(function (progress) {
	                _this2.setStatus(Status.PROGRESS);
	                _this2.emit(Events.FILE_UPLOAD_PROGRESS, progress);
	            }).done(function (response) {
	                _this2.response = response;
	                _this2._session = null;
	                _this2._sessionPromise = null;
	                _this2._flows = [];
	                _this2.setStatus(Status.SUCCESS);
	                _this2.emit(Events.FILE_UPLOAD_SUCCESS, response);
	            }).fail(function (error) {
	                _this2._session = null;
	                _this2._sessionPromise = null;
	                var flow = undefined;
	                while (flow = _this2._flows.shift()) {
	                    flow.abort();
	                }
	
	                if (error instanceof Error) {
	                    _this2.setStatus(Status.ERROR);
	                    _this2.emit(Events.FILE_UPLOAD_ERROR, error);
	                }
	            }).always(function () {
	                _this2.emit(Events.FILE_UPLOAD_COMPLETED, _this2.getStatus());
	            });
	
	            this._flows = [];
	            this._session = ret;
	            this._sessionPromise = ret.promise();
	
	            return this._sessionPromise;
	        }
	    }, {
	        key: 'prepare',
	        value: function prepare() {
	            var _this3 = this;
	
	            if (this.status !== Status.PENDING || !this.core) {
	                return false;
	            }
	
	            this.session();
	            this.setStatus(Status.PROGRESS);
	
	            this.emit(Events.FILE_UPLOAD_START);
	
	            this.request = this.core.createFileRequest(this);
	
	            var ret = this.core.invoke(Events.FILE_UPLOAD_PREPARING, this.request);
	
	            this._flows.push(ret);
	
	            ret.then(function (request) {
	                _this3.emit(Events.FILE_UPLOAD_PREPARED, request);
	
	                var upload = _this3.runtime.getUploading().generate(request);
	
	                _this3._flows.push(upload);
	
	                upload.progress(function (e) {
	                    _this3.progress.change(e.total, e.loaded);
	                    _this3._session.notify(_this3.progress);
	                });
	
	                return upload;
	            }).then(function (response) {
	                return _this3.complete(response);
	            }, this._session.reject);
	
	            return true;
	        }
	    }, {
	        key: 'complete',
	        value: function complete(response) {
	            if (this.status !== Status.PROGRESS) return;
	
	            var flow = undefined;
	            while (flow = this._flows.shift()) {
	                flow.abort();
	            }
	
	            this.progress.done();
	            this._session.notify(this.progress);
	
	            response = this.request.createFileResponse(response);
	
	            this.setStatus(Status.END);
	            this.emit(Events.FILE_UPLOAD_END);
	
	            var ret = this.core.invoke(Events.FILE_UPLOAD_COMPLETING, response);
	
	            this._flows.push(ret);
	
	            ret.then(this._session.resolve, this._session.reject);
	        }
	    }, {
	        key: 'pending',
	        value: function pending() {
	            if (this.status === Status.ERROR || this.status === Status.QUEUED) {
	                this.progress.change(this.size, 0);
	                this.setStatus(Status.PENDING);
	            }
	        }
	    }, {
	        key: 'abort',
	        value: function abort() {
	            this._session && this._session.reject();
	            this._session = null;
	            this._sessionPromise = null;
	        }
	    }, {
	        key: 'cancel',
	        value: function cancel(silent) {
	            this.setStatus(Status.CANCELLED, silent);
	            !silent && this.emit(Events.FILE_CANCEL);
	            this.abort();
	            this.runtime.cancel(this.source);
	            this._dataUrlPromise && this._dataUrlPromise.abort();
	            this._md5Promise && this._md5Promise.abort && this._md5Promise.abort();
	            this.removeAllListeners();
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.cancel();
	        }
	    }]);
	
	    return File;
	})(Emitter);
	
	module.exports = File;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Emitter = __webpack_require__(2);
	var Runtime = __webpack_require__(9);
	var File = __webpack_require__(12);
	
	var PasteCollector = (function () {
	    function PasteCollector(core) {
	        _classCallCheck(this, PasteCollector);
	
	        this.core = core;
	        this.runtime = Runtime.getInstance();
	    }
	
	    _createClass(PasteCollector, [{
	        key: 'addArea',
	        value: function addArea(area) {
	            var core = this.core,
	                runtime = this.runtime,
	                emitter = new Emitter();
	
	            var paste = function paste(e) {
	
	                var clipboardData = e.clipboardData || window.clipboardData,
	                    items = clipboardData.items,
	                    files = clipboardData.files;
	
	                if (!files && !items) {
	                    return;
	                }
	
	                var prevent = undefined,
	                    i = undefined,
	                    l = undefined,
	                    file = undefined,
	                    item = undefined,
	                    addRet = undefined;
	
	                if (files && files.length) {
	                    // safari has files
	                    prevent = files.length > 0;
	                    for (i = 0, l = files.length; i < l; i++) {
	                        file = new File(runtime, files[i]);
	
	                        prevent = 1;
	
	                        addRet = core.add(file);
	                        if (addRet < 0 || addRet > 0 && !core.isMultiple()) {
	                            break;
	                        }
	                    }
	                } else if (items && items.length) {
	                    // chrome has items
	                    var filename = clipboardData.getData('text/plain');
	                    for (i = 0, l = items.length; i < l && !core.isLimit(); i++) {
	                        item = items[i];
	
	                        if (item.kind !== 'file' || !(file = item.getAsFile())) {
	                            continue;
	                        }
	
	                        file = new File(runtime, file, filename);
	                        filename = null;
	
	                        prevent = 1;
	
	                        addRet = core.add(file);
	                        if (addRet < 0 || addRet > 0 && !core.isMultiple()) {
	                            break;
	                        }
	                    }
	                }
	
	                if (prevent) {
	                    e.preventDefault();
	                    e.stopPropagation();
	                    emitter.emit('paste', clipboardData);
	                }
	            };
	
	            if ('DataTransfer' in window && 'FileList' in window && area.addEventListener) {
	                area.addEventListener('paste', paste, false);
	            }
	
	            emitter.destroy = function () {
	                emitter.removeAllListeners();
	                if (area.removeEventListener) {
	                    area.removeEventListener('paste', paste, false);
	                }
	            };
	
	            return emitter;
	        }
	    }]);
	
	    return PasteCollector;
	})();
	
	module.exports = PasteCollector;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	var Emitter = __webpack_require__(2);
	var Html5Runtime = __webpack_require__(9);
	var FlashRuntime = __webpack_require__(15);
	var File = __webpack_require__(12);
	
	var _require = __webpack_require__(3);
	
	var extend = _require.extend;
	
	var SWF_URL = '';
	
	var createElement = (function () {
	    if ((typeof document === 'undefined' ? 'undefined' : _typeof(document)) !== 'object') {
	        return;
	    }
	
	    var div = document.createElement('div');
	    return function (html) {
	        div.innerHTML = html;
	        html = div.firstChild;
	        div.removeChild(html);
	        return html;
	    };
	})();
	
	var FlashTriggerCollection = (function () {
	    function FlashTriggerCollection(core, onFiles) {
	        var _this = this;
	
	        _classCallCheck(this, FlashTriggerCollection);
	
	        var overlay = createElement('<label style="position:fixed;left:-100px;top:-100px;width:50px;height:50px;display:block;cursor:pointer;overflow:hidden;z-index:99999;opacity:0;filter:alpha(opacity=0)"></label>');
	
	        var runtime = new FlashRuntime(overlay, SWF_URL, function () {
	            return {
	                accept: core.getAccept(),
	                multiple: core.isMultiple()
	            };
	        });
	
	        runtime.on('select', function (e) {
	            onFiles(e.files, runtime);
	            _this.current && _this.current.emit('files', e.files, runtime);
	        });
	
	        runtime.on('rollOut', function () {
	            return _this.hideOverlay();
	        });
	
	        document.body.appendChild(overlay);
	        this.overlay = overlay;
	    }
	
	    _createClass(FlashTriggerCollection, [{
	        key: 'hideOverlay',
	        value: function hideOverlay() {
	            extend(this.overlay.style, {
	                left: '-100px',
	                top: '-100px',
	                width: '50px',
	                height: '50px'
	            });
	            if (this.current) {
	                this.current.emit('rollOut');
	                this.current = null;
	            }
	        }
	    }, {
	        key: 'add',
	        value: function add(trigger) {
	            var _this2 = this;
	
	            var overlay = this.overlay,
	                emitter = new Emitter();
	            var mouseover = function mouseover() {
	                var rect = trigger.getBoundingClientRect();
	                extend(overlay.style, {
	                    left: rect.left + 'px',
	                    top: rect.top + 'px',
	                    width: rect.right - rect.left + 'px',
	                    height: rect.bottom - rect.top + 'px'
	                });
	                emitter.emit('rollOver');
	                if (_this2.current && _this2.current !== emitter) {
	                    _this2.current.emit('rollOut');
	                }
	                _this2.current = emitter;
	            };
	
	            if (trigger.addEventListener) {
	                trigger.addEventListener('mouseover', mouseover, false);
	            } else if (trigger.attachEvent) {
	                trigger.attachEvent("onmouseover", mouseover);
	            }
	
	            emitter.destroy = function () {
	                if (_this2.current === emitter) {
	                    _this2.hideOverlay();
	                }
	                emitter.removeAllListeners();
	                if (trigger.removeEventListener) {
	                    trigger.removeEventListener('mouseover', mouseover, false);
	                } else if (trigger.detachEvent) {
	                    trigger.detachEvent("onmouseover", mouseover);
	                }
	            };
	
	            return emitter;
	        }
	    }]);
	
	    return FlashTriggerCollection;
	})();
	
	var Html5Trigger = (function (_Emitter) {
	    _inherits(Html5Trigger, _Emitter);
	
	    function Html5Trigger(trigger, core, onFiles) {
	        _classCallCheck(this, Html5Trigger);
	
	        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Html5Trigger).call(this));
	
	        _this3.trigger = trigger;
	        _this3.core = core;
	        _this3.label = createElement('<label style="position:absolute;top:0;left:0;width:100%;height:100%;display:inline-block;cursor:pointer;background:#fff;overflow:hidden;opacity:0"></label>');
	
	        _this3.onChange = function (e) {
	            onFiles(e.target.files);
	            _this3.destroyInput();
	            _this3.createInput();
	        };
	        trigger.appendChild(_this3.label);
	        _this3.createInput();
	        return _this3;
	    }
	
	    _createClass(Html5Trigger, [{
	        key: 'createInput',
	        value: function createInput() {
	            var input = createElement('<input type="file" style="position:absolute;clip:rect(1px 1px 1px 1px);" />');
	
	            var accept = this.core.getAccept();
	            if (accept && accept.length > 0) {
	                accept = accept.map(function (item) {
	                    return item.mimeTypes || '.' + item.extensions.join(',.');
	                });
	
	                input.setAttribute('accept', accept.join(','));
	            }
	            if (this.core.isMultiple()) {
	                input.setAttribute('multiple', 'multiple');
	            }
	
	            input.addEventListener('change', this.onChange, false);
	
	            this.label.appendChild(input);
	            this.input = input;
	        }
	    }, {
	        key: 'destroyInput',
	        value: function destroyInput() {
	            if (!this.input) return;
	            this.input.removeEventListener('change', this.onChange, false);
	            this.label.removeChild(this.input);
	            this.input = null;
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.destroyInput();
	            this.removeAllListeners();
	            this.trigger.removeChild(this.label);
	        }
	    }]);
	
	    return Html5Trigger;
	})(Emitter);
	
	var Html5TriggerCollection = (function () {
	    function Html5TriggerCollection(core, onFiles) {
	        _classCallCheck(this, Html5TriggerCollection);
	
	        var runtime = Html5Runtime.getInstance();
	        this.core = core;
	        this.onFiles = function (files) {
	            onFiles(files, runtime);
	        };
	    }
	
	    _createClass(Html5TriggerCollection, [{
	        key: 'add',
	        value: function add(trigger) {
	            return new Html5Trigger(trigger, this.core, this.onFiles);
	        }
	    }]);
	
	    return Html5TriggerCollection;
	})();
	
	var PickerCollector = (function () {
	    _createClass(PickerCollector, null, [{
	        key: 'setSWF',
	        value: function setSWF(url) {
	            SWF_URL = url;
	        }
	    }]);
	
	    function PickerCollector(core) {
	        _classCallCheck(this, PickerCollector);
	
	        var onFiles = function onFiles(files, runtime) {
	            for (var i = 0, l = files.length; i < l; i++) {
	                if (core.add(new File(runtime, files[i])) < 0) {
	                    break;
	                }
	            }
	        };
	
	        if (window.File && window.FileList && window.FileReader) {
	            this.triggerCollection = new Html5TriggerCollection(core, onFiles);
	        } else {
	            this.triggerCollection = new FlashTriggerCollection(core, onFiles);
	        }
	    }
	
	    _createClass(PickerCollector, [{
	        key: 'addArea',
	        value: function addArea(area) {
	            return this.triggerCollection.add(area);
	        }
	    }]);
	
	    return PickerCollector;
	})();
	
	module.exports = PickerCollector;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Runtime = __webpack_require__(10);
	var Transport = __webpack_require__(16);
	
	function getFlashVersion() {
	    var version = undefined;
	
	    try {
	        version = navigator.plugins['Shockwave Flash'];
	        version = version.description;
	    } catch (e1) {
	        try {
	            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	        } catch (e2) {
	            version = '0.0';
	        }
	    }
	    version = version.match(/\d+/g);
	    return parseFloat(version[0] + '.' + version[1]);
	}
	
	function callFlash(movie, functionName, argumentArray) {
	    try {
	        movie.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray || [], 0) + '</invoke>');
	    } catch (ex) {
	        throw "Call to " + functionName + " failed";
	    }
	}
	
	function createFlash(swf, callInterface) {
	    if (getFlashVersion() < 11.4) {
	        throw 'flash player is not available';
	    }
	    var div = document.createElement('div');
	    var url = swf + (swf.indexOf('?') > 0 ? '&' : '?') + 'callInterface=' + encodeURIComponent(callInterface);
	    var attrs = ['id="' + callInterface + '-Picker"', 'type="application/x-shockwave-flash"', 'data="' + url + '"', 'width="100%" height="100%"', 'style="position:absolute;left:0;top:0;display:block;z-index:1;outline:0"'];
	    if (window.ActiveXObject) {
	        attrs.push('classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"');
	    }
	    div.innerHTML = '<object ' + attrs.join(' ') + '>' + '<param name="movie" value="' + url + '" />' + '<param name="wmode" value="transparent" />' + '<param name="allowscriptaccess" value="always" />' + '</object>';
	
	    return div.firstChild;
	}
	
	var _guid = +new Date();
	function guid(prefix) {
	    var ret = prefix + (_guid++).toString(16);
	    if (ret in window) {
	        return guid(prefix);
	    }
	    return ret;
	}
	
	var FlashRuntime = (function (_Runtime) {
	    _inherits(FlashRuntime, _Runtime);
	
	    function FlashRuntime(trigger, swf, options) {
	        _classCallCheck(this, FlashRuntime);
	
	        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(FlashRuntime).call(this));
	
	        var callInterface = guid('FlashRuntime');
	
	        _this2.callInterface = callInterface;
	        window[callInterface] = _this2;
	
	        _this2.options = options;
	
	        var _this = _this2;
	        function display() {
	            var w = trigger.offsetWidth,
	                h = trigger.offsetHeight,
	                flash = undefined;
	            if (!w || !h || !(flash = createFlash(swf, callInterface))) {
	                setTimeout(display, 1000);
	                return;
	            }
	
	            trigger.appendChild(_this.flash = flash);
	        }
	
	        display();
	        return _this2;
	    }
	
	    _createClass(FlashRuntime, [{
	        key: 'getOptions',
	        value: function getOptions() {
	            var options = this.options;
	            if (typeof options === 'function') {
	                options = options();
	            }
	            return options;
	        }
	    }, {
	        key: 'getTransport',
	        value: function getTransport(name, blob, options) {
	            return new Transport(this, name, blob, options);
	        }
	    }, {
	        key: 'send',
	        value: function send(name, blob, url, params) {
	            callFlash(this.flash, 'exec', ['send', name, blob.id, url, params]);
	        }
	    }, {
	        key: 'abort',
	        value: function abort(blob) {
	            try {
	                callFlash(this.flash, 'exec', ['abort', blob.id]);
	            } catch (e) {}
	        }
	    }, {
	        key: 'cancel',
	        value: function cancel(blob) {
	            callFlash(this.flash, 'exec', ['cancel', blob.id]);
	        }
	    }, {
	        key: 'ping',
	        value: function ping() {
	            callFlash(this.flash, 'exec', ['pang']);
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            delete window[this.callInterface];
	        }
	    }]);
	
	    return FlashRuntime;
	})(Runtime);
	
	module.exports = FlashRuntime;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _require = __webpack_require__(3);
	
	var Deferred = _require.Deferred;
	
	var _require2 = __webpack_require__(6);
	
	var TimeoutError = _require2.TimeoutError;
	var AbortError = _require2.AbortError;
	var NetworkError = _require2.NetworkError;
	
	var FlashTransport = (function () {
	    function FlashTransport(flashRuntime) {
	        _classCallCheck(this, FlashTransport);
	
	        this.flashRuntime = flashRuntime;
	    }
	
	    /**
	     * @param {ChunkRequest} request
	     * @returns {*}
	     */
	
	    _createClass(FlashTransport, [{
	        key: 'generate',
	        value: function generate(request) {
	            var i = Deferred(),
	                flashRuntime = this.flashRuntime,
	                blob = request.getBlob();
	
	            var timeoutTimer = undefined;
	
	            var clean = function clean() {
	                flashRuntime.off('uploadprogress', progress);
	                flashRuntime.off('uploadcomplete', complete);
	                flashRuntime.off('uploaderror', error);
	                if (timeoutTimer) {
	                    clearTimeout(timeoutTimer);
	                }
	            };
	            var abort = function abort() {
	                clean();
	                flashRuntime.abort(blob.id);
	            };
	
	            var progress = function progress(e) {
	                if (e.id !== blob.id) return;
	                i.notify(e);
	            };
	
	            var complete = function complete(e) {
	                if (e.id !== blob.id) return;
	                clean();
	                if (e.status === 304 || e.status >= 200 && e.status < 300) {
	                    flashRuntime.cancel(blob);
	                    return i.resolve(e.response);
	                }
	                return i.reject(new NetworkError(e.status, e.response));
	            };
	
	            var error = function error(e) {
	                if (e.id !== blob.id) return;
	                clean();
	                i.reject(new AbortError(e.message));
	            };
	            flashRuntime.on('uploadprogress', progress);
	            flashRuntime.on('uploadcomplete', complete);
	            flashRuntime.on('uploaderror', error);
	
	            // Timeout
	            var timeout = request.getTimeout();
	            if (timeout > 0) {
	                timeoutTimer = setTimeout(function () {
	                    abort();
	                    i.reject(new TimeoutError('timeout:' + timeout));
	                }, timeout);
	            }
	
	            try {
	                flashRuntime.send(request.getName(), blob, request.getUrl(), request.getParams().toString());
	            } catch (e) {
	                abort();
	                i.reject(new AbortError(e.message));
	            }
	
	            var ret = i.promise();
	            ret.abort = abort;
	
	            return ret;
	        }
	    }]);
	
	    return FlashTransport;
	})();
	
	module.exports = FlashTransport;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=uploadcore.js.map