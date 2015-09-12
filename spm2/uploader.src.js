define(function (require, exports, module) {
    var jQuery = require('jquery');
    var SparkMD5 = require('spark-md5');

    var UXUploader =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _srcContext = __webpack_require__(1);

	var _srcContext2 = _interopRequireDefault(_srcContext);

	var _srcEvents = __webpack_require__(4);

	var _srcEvents2 = _interopRequireDefault(_srcEvents);

	var _srcStatus = __webpack_require__(5);

	var _srcStatus2 = _interopRequireDefault(_srcStatus);

	exports['default'] = _srcContext2['default'];
	exports.Uploader = _srcContext2['default'];
	exports.Events = _srcEvents2['default'];
	exports.Status = _srcStatus2['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _events = __webpack_require__(4);

	var _events2 = _interopRequireDefault(_events);

	var _status = __webpack_require__(5);

	var _status2 = _interopRequireDefault(_status);

	var _errors = __webpack_require__(6);

	var _util = __webpack_require__(7);

	var _filerequest = __webpack_require__(8);

	var _filerequest2 = _interopRequireDefault(_filerequest);

	var _collectorDnd = __webpack_require__(9);

	var _collectorDnd2 = _interopRequireDefault(_collectorDnd);

	var _collectorPaste = __webpack_require__(14);

	var _collectorPaste2 = _interopRequireDefault(_collectorPaste);

	var _collectorPicker = __webpack_require__(15);

	var _collectorPicker2 = _interopRequireDefault(_collectorPicker);

	var Context = (function (_Emitter) {
	    _inherits(Context, _Emitter);

	    function Context(options) {
	        var _this = this;

	        _classCallCheck(this, Context);

	        _get(Object.getPrototypeOf(Context.prototype), 'constructor', this).call(this);

	        var processThreads = options.processThreads;
	        var autoPending = options.autoPending;
	        var queueCapcity = options.queueCapcity;
	        var accept = options.accept;
	        var sizeLimit = options.sizeLimit;
	        var preventDuplicate = options.preventDuplicate;
	        var multiple = options.multiple;

	        this.stat = new Stat();
	        this.constraints = new Constraints();
	        this.filters = new Filters();
	        this.accept = (0, _util.normalizeAccept)(accept);
	        this.autoPending = autoPending;
	        this.multiple = multiple == null ? true : multiple;
	        this.pending = new Pending(processThreads);

	        if (queueCapcity && queueCapcity > 0) {
	            this.addConstraint(function () {
	                return _this.stat.getTotal() >= queueCapcity;
	            });
	        }

	        if (this.accept && this.accept.length > 0) {
	            this.addFilter(function (file) {
	                if (!_this.accept.some(function (item) {
	                    return item.extensions && item.extensions.indexOf(file.ext) > -1;
	                })) {
	                    return new _errors.FileExtensionError(file, 'extension "' + file.ext + '" is not allowed');
	                }
	            });
	        }

	        if (sizeLimit && (sizeLimit = (0, _util.parseSize)(sizeLimit)) > 0) {
	            this.addFilter(function (file) {
	                if (file.size > sizeLimit) {
	                    return new _errors.FileSizeError(file, 'filesize:' + (0, _util.formatSize)(file.size) + ' is greater than limit:' + (0, _util.formatSize)(sizeLimit));
	                }
	            });
	        }

	        if (preventDuplicate) {
	            this.addFilter(function (file) {
	                if (_this.stat.getFiles().some(function (item) {
	                    return item.name === file.name && item.size === file.size;
	                })) {
	                    return new _errors.DuplicateError(file, 'file "' + file.name + '" already in queue');
	                }
	            });
	        }

	        this.requestOptions = options.request || {};
	    }

	    _createClass(Context, [{
	        key: 'createFileRequest',
	        value: function createFileRequest(file) {
	            return new _filerequest2['default'](file, this.requestOptions);
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
	            var _this2 = this;

	            if (this.isLimit()) {
	                this.emit(_events2['default'].QUEUE_ERROR, new _errors.QueueLimitError());
	                return -1;
	            }

	            var error = this.filters.filter(file);
	            if (!error && !this.stat.add(file)) {
	                error = new _errors.DuplicateError(file, 'file "' + file.name + '" already in queue');
	            }

	            if (error) {
	                this.emit(_events2['default'].QUEUE_FILE_FILTERED, file, error);
	                this.emit(_events2['default'].QUEUE_ERROR, error);
	                return 0;
	            }

	            file.setStatus(_status2['default'].QUEUED);

	            file.on(_events2['default'].FILE_STATUS_CHANGE, function (status) {
	                if (status === _status2['default'].CANCELLED) {
	                    _this2.stat.remove(file);
	                } else if (status === _status2['default'].PENDING) {
	                    setTimeout(function () {
	                        if (_this2.pending.add(file) && _this2.pending.size() === 1) {
	                            _this2.emit(_events2['default'].QUEUE_UPLOAD_START);
	                        }
	                    }, 1);
	                }

	                _this2.emit(_events2['default'].QUEUE_STAT_CHANGE, _this2.stat);

	                if (_this2.stat.getFiles(_status2['default'].PROCESS).length < 1) {
	                    _this2.emit(_events2['default'].QUEUE_UPLOAD_END);
	                }
	            });

	            file.setContext(this);

	            this.emit(_events2['default'].QUEUE_FILE_ADDED, file);

	            this.emit(_events2['default'].QUEUE_STAT_CHANGE, this.stat);

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
	        key: 'getPickerCollector',
	        value: function getPickerCollector() {
	            if (!this.picker) {
	                this.picker = new _collectorPicker2['default'](this);
	            }
	            return this.picker;
	        }
	    }, {
	        key: 'getDndCollector',
	        value: function getDndCollector() {
	            if (!this.dnd) {
	                this.dnd = new _collectorDnd2['default'](this);
	            }
	            return this.dnd;
	        }
	    }, {
	        key: 'getPasteCollector',
	        value: function getPasteCollector() {
	            if (!this.paster) {
	                this.paster = new _collectorPaste2['default'](this);
	            }
	            return this.paster;
	        }
	    }], [{
	        key: 'setSWF',
	        value: function setSWF(url) {
	            _collectorPicker2['default'].setSWF(url);
	        }
	    }]);

	    return Context;
	})(_emitter2['default']);

	exports['default'] = Context;

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
	            var stat = {},
	                files = this.getFiles(flag);

	            files.forEach(function (file) {
	                var status = file.getStatus();
	                stat[status] = status in stat ? stat[status] + 1 : 1;
	            });

	            stat['sum'] = files.length;

	            return stat;
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
	            var _this3 = this;

	            return this.constraints.toArray().some(function (fn) {
	                return fn.call(_this3);
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
	                    error = new _errors.FilterError(file, ret);
	                    return false;
	                } else if (ret instanceof Error) {
	                    error = ret instanceof _errors.FilterError ? ret : new _errors.FilterError(file, ret.toString());
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
	            var _this4 = this;

	            if (!this.pending.add(file)) return false;

	            file.session().always(function () {
	                return _this4.pending.remove(file);
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
	            var _this5 = this;

	            if (!this.heading.add(file)) return;

	            file.session().always(function () {
	                _this5.heading.remove(file);
	                _this5.load();
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

	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _jquery = __webpack_require__(3);

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

	            return this;
	        }
	    }, {
	        key: 'applyEmit',
	        value: function applyEmit(event, args) {
	            var _this = this;

	            event = event.toLowerCase();

	            var listeners = undefined;

	            if (this._events && (listeners = this._events[event])) {
	                listeners.slice(0).forEach(function (fn) {
	                    return fn.apply(_this, args);
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

	exports['default'] = Emitter;

	function HookInvoker(hooks, initialData, context) {
	    var _data = initialData;
	    var _error = null;
	    var _aborted = undefined;

	    var i = (0, _jquery.Deferred)();
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
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = {
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
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = {
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
	var StatusName = {
	    1: 'inited',
	    2: 'queued',
	    4: 'pending',
	    8: 'progress',
	    16: 'end',
	    32: 'success',
	    64: 'error',
	    128: 'cancelled'
	};
	exports.StatusName = StatusName;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _Error = (function (_Error2) {
	    _inherits(_Error, _Error2);

	    function _Error(message) {
	        _classCallCheck(this, _Error);

	        _get(Object.getPrototypeOf(_Error.prototype), 'constructor', this).call(this, message);
	        this.message = message;
	    }

	    return _Error;
	})(Error);

	var AbortError = (function (_Error3) {
	    _inherits(AbortError, _Error3);

	    function AbortError(message) {
	        _classCallCheck(this, AbortError);

	        _get(Object.getPrototypeOf(AbortError.prototype), 'constructor', this).call(this, message);
	        this.name = 'AbortError';
	    }

	    return AbortError;
	})(_Error);

	exports.AbortError = AbortError;

	var TimeoutError = (function (_Error4) {
	    _inherits(TimeoutError, _Error4);

	    function TimeoutError(message) {
	        _classCallCheck(this, TimeoutError);

	        _get(Object.getPrototypeOf(TimeoutError.prototype), 'constructor', this).call(this, message);
	        this.name = 'TimeoutError';
	    }

	    return TimeoutError;
	})(_Error);

	exports.TimeoutError = TimeoutError;

	var NetworkError = (function (_Error5) {
	    _inherits(NetworkError, _Error5);

	    function NetworkError(status, message) {
	        _classCallCheck(this, NetworkError);

	        _get(Object.getPrototypeOf(NetworkError.prototype), 'constructor', this).call(this, message);
	        this.name = 'NetworkError';
	        this.status = status;
	    }

	    return NetworkError;
	})(_Error);

	exports.NetworkError = NetworkError;

	var QueueLimitError = (function (_Error6) {
	    _inherits(QueueLimitError, _Error6);

	    function QueueLimitError() {
	        _classCallCheck(this, QueueLimitError);

	        _get(Object.getPrototypeOf(QueueLimitError.prototype), 'constructor', this).call(this, 'queue limit');
	        this.name = 'QueueLimitError';
	    }

	    return QueueLimitError;
	})(_Error);

	exports.QueueLimitError = QueueLimitError;

	var FilterError = (function (_Error7) {
	    _inherits(FilterError, _Error7);

	    function FilterError(file, message) {
	        _classCallCheck(this, FilterError);

	        _get(Object.getPrototypeOf(FilterError.prototype), 'constructor', this).call(this, message);
	        this.name = 'FilterError';
	        this.file = file;
	    }

	    return FilterError;
	})(_Error);

	exports.FilterError = FilterError;

	var DuplicateError = (function (_FilterError) {
	    _inherits(DuplicateError, _FilterError);

	    function DuplicateError(file, message) {
	        _classCallCheck(this, DuplicateError);

	        _get(Object.getPrototypeOf(DuplicateError.prototype), 'constructor', this).call(this, file, message);
	        this.name = 'DuplicateError';
	    }

	    return DuplicateError;
	})(FilterError);

	exports.DuplicateError = DuplicateError;

	var FileExtensionError = (function (_FilterError2) {
	    _inherits(FileExtensionError, _FilterError2);

	    function FileExtensionError(file, message) {
	        _classCallCheck(this, FileExtensionError);

	        _get(Object.getPrototypeOf(FileExtensionError.prototype), 'constructor', this).call(this, file, message);
	        this.name = 'FileExtensionError';
	    }

	    return FileExtensionError;
	})(FilterError);

	exports.FileExtensionError = FileExtensionError;

	var FileSizeError = (function (_FilterError3) {
	    _inherits(FileSizeError, _FilterError3);

	    function FileSizeError(file, message) {
	        _classCallCheck(this, FileSizeError);

	        _get(Object.getPrototypeOf(FileSizeError.prototype), 'constructor', this).call(this, file, message);
	        this.name = 'FileSizeError';
	    }

	    return FileSizeError;
	})(FilterError);

	exports.FileSizeError = FileSizeError;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports.formatSize = formatSize;
	exports.parseSize = parseSize;
	exports.normalizeAccept = normalizeAccept;

	function formatSize(size) {
	    size = parseFloat(size);
	    var prefixesSI = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
	        base = 1024;
	    var index = size ? Math.floor(Math.log(size) / Math.log(base)) : 0;
	    index = Math.min(index, prefixesSI.length - 1);
	    var powedPrecision = Math.pow(10, index < 2 ? 0 : index > 2 ? 2 : 1);
	    size = size / Math.pow(base, index);
	    size = Math.round(size * powedPrecision) / powedPrecision;
	    return size + prefixesSI[index] + 'B';
	}

	function parseSize(size) {
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
	}

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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _util = __webpack_require__(7);

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

	        this.index = index;
	        this.blob = blob;
	        this.fileRequest = fileRequest;
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
	        } else if (typeof params === 'object') {
	            this.params = [];
	            for (var _name in params) {
	                if (params.hasOwnProperty(_name)) {
	                    this.params.push({ name: _name, value: params[_name] });
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
	        this.url = options.url;
	        this.params = new Params(options.params);
	        this.headers = options.headers || [];
	        this.withCredentials = options.withCredentials;
	        this.timeout = options.timeout || 0;
	        this.chunkSize = options.chunkSize || 0;
	        this.chunkRetries = options.chunkRetries || 0;
	        this.chunkEnable = options.chunkEnable || false;
	        this.chunkProcessThreads = options.chunkProcessThreads || 0;
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
	            return (0, _util.parseSize)(this.chunkSize);
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

	exports['default'] = FileRequest;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _jquery = __webpack_require__(3);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _html5Runtime = __webpack_require__(10);

	var _html5Runtime2 = _interopRequireDefault(_html5Runtime);

	var _file = __webpack_require__(13);

	var _file2 = _interopRequireDefault(_file);

	function createReader(collector) {
	    var _break = false;
	    function reader(dataTransfer, responders) {
	        var items = dataTransfer.items,
	            files = dataTransfer.files,
	            item;

	        for (var i = 0, l = files.length; i < l; i++) {
	            if (_break) break;
	            item = items && items[i];

	            var entry = item && item.webkitGetAsEntry && item.webkitGetAsEntry();

	            if (entry && entry.isDirectory) {
	                readEntry(entry, responders);
	            } else {
	                if (!collector(files[i], responders)) {
	                    _break = true;
	                    break;
	                }
	            }
	        }
	    }
	    function readEntry(entry, responders) {
	        if (_break) return;
	        if (entry.isFile) {
	            entry.file(function (file) {
	                if (_break) return;
	                if (!collector(file, responders)) {
	                    _break = true;
	                }
	            });
	        } else if (entry.isDirectory) {
	            entry.createReader().readEntries(function (entries) {
	                if (_break) return;
	                for (var i = 0, l = entries.length; i < l; i++) {
	                    if (_break) break;
	                    readEntry(entries[i], responders);
	                }
	            });
	        }
	    }
	    return reader;
	}

	var Area = (function (_Emitter) {
	    _inherits(Area, _Emitter);

	    function Area(area) {
	        _classCallCheck(this, Area);

	        _get(Object.getPrototypeOf(Area.prototype), 'constructor', this).call(this);

	        this.areaElement = area;
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
	})(_emitter2['default']);

	var Collectors = [];

	function prepare() {
	    if (!('DataTransfer' in window) || !('FileList' in window)) {
	        return;
	    }

	    var $doc = (0, _jquery2['default'])(document),
	        runtime = _html5Runtime2['default'].getInstance();

	    var started = 0,
	        enter = 0,
	        endTimer = undefined;
	    var dataTransferReader = createReader(function (file, responders) {
	        if (!responders || responders.length < 1) {
	            return false;
	        }
	        file = new _file2['default'](runtime, file);
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

	        var dataTransfer = (e.originalEvent || e).dataTransfer;

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

	        var dataTransfer = (e.originalEvent || e).dataTransfer;

	        try {
	            if (dataTransfer.getData('text/html')) {
	                return;
	            }
	        } catch (ex) {}

	        dataTransferReader(dataTransfer, responders);
	    };

	    $doc.on('dragenter dragover dragleave', drag);
	    $doc.on('drop', drop);
	}

	var DndCollector = (function () {
	    function DndCollector(context) {
	        _classCallCheck(this, DndCollector);

	        if (Collectors.length < 1) {
	            prepare();
	        }
	        Collectors.push(this);

	        this.context = context;
	        this.areas = [];
	    }

	    _createClass(DndCollector, [{
	        key: 'addArea',
	        value: function addArea(area) {
	            var _this = this;

	            area = new Area(area);
	            this.areas.push(area);
	            area.destroy = function () {
	                area.removeAllListeners();
	                var i = _this.areas.indexOf(area);
	                if (i > -1) {
	                    _this.areas.splice(i, 1);
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
	            var ret = this.context.add(file);
	            if (ret > 0 && !this.context.isMultiple()) {
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

	exports['default'] = DndCollector;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _jquery = __webpack_require__(3);

	var _runtime = __webpack_require__(11);

	var _runtime2 = _interopRequireDefault(_runtime);

	var _transport = __webpack_require__(12);

	var _transport2 = _interopRequireDefault(_transport);

	var instance = undefined;

	var Html5Runtime = (function (_Runtime) {
	    _inherits(Html5Runtime, _Runtime);

	    function Html5Runtime() {
	        _classCallCheck(this, Html5Runtime);

	        _get(Object.getPrototypeOf(Html5Runtime.prototype), 'constructor', this).apply(this, arguments);
	    }

	    _createClass(Html5Runtime, [{
	        key: 'getAsDataUrl',
	        value: function getAsDataUrl(blob, timeout) {
	            var i = (0, _jquery.Deferred)(),
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
	                this.transport = new _transport2['default'](this);
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
	            var i = (0, _jquery.Deferred)();

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
	})(_runtime2['default']);

	exports['default'] = Html5Runtime;
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _events = __webpack_require__(4);

	var _events2 = _interopRequireDefault(_events);

	var _errors = __webpack_require__(6);

	var _jquery = __webpack_require__(3);

	var Runtime = (function (_Emitter) {
	    _inherits(Runtime, _Emitter);

	    function Runtime() {
	        _classCallCheck(this, Runtime);

	        _get(Object.getPrototypeOf(Runtime.prototype), 'constructor', this).apply(this, arguments);
	    }

	    _createClass(Runtime, [{
	        key: 'md5',
	        value: function md5(blob) {
	            var i = (0, _jquery.Deferred)();
	            i.reject();
	            return i.promise();
	        }
	    }, {
	        key: 'getAsDataUrl',
	        value: function getAsDataUrl(file, timeout) {
	            var i = (0, _jquery.Deferred)();
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
	})(_emitter2['default']);

	exports['default'] = Runtime;

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
	            var _this = this;

	            var i = (0, _jquery.Deferred)(),
	                file = request.getFile(),
	                runtime = this.runtime;

	            var source = file.getSource(),
	                size = file.size,
	                chunkSize = request.getChunkSize(),
	                useChunk = request.isChunkEnable(),
	                threads = request.getChunkProcessThreads(),
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
	                    slot = _this.slot(req, request.getChunkRetries());
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
	                var slot = this.slot(request.createChunkRequest(0, source), 0);
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
	            var i = (0, _jquery.Deferred)(),
	                runtime = this.runtime,
	                context = request.getFile().getContext();

	            var slot = i.promise();

	            var progress = function progress(e) {
	                if (e.total) {
	                    slot.total = e.total;
	                }
	                if (e.loaded) {
	                    slot.loaded = e.loaded;
	                }
	                i.notify(e);
	            };

	            var process = function process() {
	                var prepare, transport, completion;
	                slot.abort = function () {
	                    prepare && prepare.abort();
	                    transport && transport.abort();
	                    completion && completion.abort();
	                };
	                slot.total = request.getBlob().size;
	                slot.loaded = 0;

	                prepare = context.invoke(_events2['default'].CHUNK_UPLOAD_PREPARING, request);

	                prepare.then(function (request) {
	                    transport = runtime.getTransport().generate(request);
	                    transport.progress(progress);
	                    return transport;
	                }).then(function (response) {
	                    completion = context.invoke(_events2['default'].CHUNK_UPLOAD_COMPLETING, request.createChunkResponse(response));
	                    return completion;
	                }).done(i.resolve).fail(error);
	            };

	            var error = function error(e) {
	                if (e instanceof _errors.NetworkError && retries-- > 0) {
	                    // retry
	                    setTimeout(process, 500);
	                } else {
	                    i.reject(e);
	                }
	                slot.abort();
	            };

	            process();

	            return slot;
	        }
	    }]);

	    return Uploading;
	})();

	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _errors = __webpack_require__(6);

	var _jquery = __webpack_require__(3);

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
	            var i = (0, _jquery.Deferred)();

	            var timeoutTimer = undefined,
	                withCredentials = false;
	            var xhr = new XMLHttpRequest();

	            if (request.isWithCredentials && !('withCredentials' in xhr) && 'XDomainRequest' in window) {
	                xhr = new XDomainRequest();
	                withCredentials = true;
	            }

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
	                    return i.reject(new _errors.AbortError(e.message));
	                }
	                if (xhr.status === 0 || xhr.status === 304 || xhr.status >= 200 && xhr.status < 300) {
	                    return i.resolve(xhr.responseText);
	                }
	                return i.reject(new _errors.NetworkError(xhr.status, xhr.statusText));
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
	                    i.reject(new _errors.TimeoutError('timeout:' + timeout));
	                }, timeout);
	            }

	            try {
	                (function () {
	                    if (withCredentials) {
	                        xhr.open('POST', request.getUrl(), true);
	                        xhr.withCredentials = true;
	                    } else {
	                        xhr.open('POST', request.getUrl());
	                    }

	                    request.getHeaders().forEach(function (header) {
	                        return xhr.setRequestHeader(header.name, header.value);
	                    });

	                    var formData = new FormData(),
	                        blob = request.getBlob();

	                    request.getParams().toArray().forEach(function (param) {
	                        return formData.append(param.name, param.value);
	                    });

	                    formData.append(request.getName(), blob, blob.name || 'blob');

	                    xhr.send(formData);
	                })();
	            } catch (e) {
	                abort();
	                i.reject(new _errors.AbortError(e.message));
	            }

	            var ret = i.promise();
	            ret.abort = abort;

	            return ret;
	        }
	    }]);

	    return Html5Transport;
	})();

	exports['default'] = Html5Transport;
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _events = __webpack_require__(4);

	var _events2 = _interopRequireDefault(_events);

	var _status = __webpack_require__(5);

	var _status2 = _interopRequireDefault(_status);

	var _jquery = __webpack_require__(3);

	var uid = 0;
	function guid() {
	    return 'FILE-' + (uid++).toString(16).toUpperCase();
	}

	var RE_EXT = /\.([^.]+)$/,
	    RE_IMAGE = /\/(jpg|jpeg|png|gif|bmp|webp)$/i;
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
	    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].indexOf(ext.toLowerCase())) {
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

	exports['default'] = Progress;

	var File = (function (_Emitter) {
	    _inherits(File, _Emitter);

	    function File(runtime, source, filename) {
	        _classCallCheck(this, File);

	        _get(Object.getPrototypeOf(File.prototype), 'constructor', this).call(this);

	        this.id = guid();

	        this.name = source.name || filename || this.id;

	        var ext = guessExt(source).toLowerCase();

	        if (ext && !RE_EXT.test(this.name)) {
	            this.name += '.' + ext;
	        }

	        this.ext = ext;

	        this.type = source.type || guessType(this.ext) || 'application/octet-stream';

	        this.lastModified = source.lastModified || +new Date();

	        this.size = source.size || 0;

	        this.runtime = runtime;

	        this.source = source;

	        this.status = _status2['default'].INITED;

	        this.progress = new Progress(this.size, 0);
	    }

	    _createClass(File, [{
	        key: 'getContext',
	        value: function getContext() {
	            return this.context;
	        }
	    }, {
	        key: 'setContext',
	        value: function setContext(context) {
	            this.context = context;
	            this.setPropagationTarget(context);
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
	        value: function setStatus(status) {
	            var prevStatus = this.status;

	            if (prevStatus !== _status2['default'].CANCELLED && status !== prevStatus) {
	                this.status = status;
	                this.emit(_events2['default'].FILE_STATUS_CHANGE, status, prevStatus);
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
	            if (this.status in _status.StatusName) {
	                return _status.StatusName[this.status];
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
	            var _this = this;

	            if (this._sessionPromise) {
	                return this._sessionPromise;
	            }

	            var session = (0, _jquery.Deferred)();

	            session.progress(function (progress) {
	                _this.setStatus(_status2['default'].PROGRESS);
	                _this.emit(_events2['default'].FILE_UPLOAD_PROGRESS, progress);
	            }).done(function (response) {
	                _this.response = response;
	                _this._session = null;
	                _this._sessionPromise = null;
	                _this._flows = [];
	                _this.setStatus(_status2['default'].SUCCESS);
	                _this.emit(_events2['default'].FILE_UPLOAD_SUCCESS, response);
	            }).fail(function (error) {
	                _this._session = null;
	                _this._sessionPromise = null;
	                var flow = undefined;
	                while (flow = _this._flows.shift()) {
	                    flow.abort();
	                }

	                if (error instanceof Error) {
	                    _this.setStatus(_status2['default'].ERROR);
	                    _this.emit(_events2['default'].FILE_UPLOAD_ERROR, error);
	                }
	            }).always(function () {
	                _this.emit(_events2['default'].FILE_UPLOAD_COMPLETED, _this.getStatus());
	            });

	            this._flows = [];
	            this._session = session;
	            this._sessionPromise = session.promise();

	            return this._sessionPromise;
	        }
	    }, {
	        key: 'prepare',
	        value: function prepare() {
	            var _this2 = this;

	            if (this.status !== _status2['default'].PENDING || !this.context) {
	                return false;
	            }

	            this.session();
	            this.setStatus(_status2['default'].PROGRESS);

	            this.emit(_events2['default'].FILE_UPLOAD_START);

	            this.request = this.context.createFileRequest(this);

	            var prepare = this.context.invoke(_events2['default'].FILE_UPLOAD_PREPARING, this.request);

	            this._flows.push(prepare);

	            prepare.then(function (request) {
	                _this2.emit(_events2['default'].FILE_UPLOAD_PREPARED, request);

	                var upload = _this2.runtime.getUploading().generate(request);

	                _this2._flows.push(upload);

	                upload.progress(function (e) {
	                    _this2.progress.change(e.total, e.loaded);
	                    _this2._session.notify(_this2.progress);
	                });

	                return upload;
	            }).then(function (response) {
	                return _this2.complete(response);
	            }, this._session.reject);

	            return true;
	        }
	    }, {
	        key: 'complete',
	        value: function complete(response) {
	            if (this.status !== _status2['default'].PROGRESS) return;

	            var flow = undefined;
	            while (flow = this._flows.shift()) {
	                flow.abort();
	            }

	            this.progress.done();
	            this._session.notify(this.progress);

	            response = this.request.createFileResponse(response);

	            this.setStatus(_status2['default'].END);
	            this.emit(_events2['default'].FILE_UPLOAD_END);

	            var complete = this.context.invoke(_events2['default'].FILE_UPLOAD_COMPLETING, response);

	            this._flows.push(complete);

	            complete.then(this._session.resolve, this._session.reject);
	        }
	    }, {
	        key: 'pending',
	        value: function pending() {
	            if (this.status === _status2['default'].ERROR || this.status === _status2['default'].QUEUED) {
	                this.progress.change(this.size, 0);
	                this.setStatus(_status2['default'].PENDING);
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
	        value: function cancel() {
	            this.setStatus(_status2['default'].CANCELLED);
	            this.emit(_events2['default'].FILE_CANCEL);
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
	})(_emitter2['default']);

	exports['default'] = File;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _jquery = __webpack_require__(3);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _html5Runtime = __webpack_require__(10);

	var _html5Runtime2 = _interopRequireDefault(_html5Runtime);

	var _file = __webpack_require__(13);

	var _file2 = _interopRequireDefault(_file);

	var PasteCollector = (function () {
	    function PasteCollector(context) {
	        _classCallCheck(this, PasteCollector);

	        this.context = context;
	        this.runtime = _html5Runtime2['default'].getInstance();
	    }

	    _createClass(PasteCollector, [{
	        key: 'addArea',
	        value: function addArea(area) {
	            area = area.on ? area : (0, _jquery2['default'])(area);

	            var context = this.context,
	                runtime = this.runtime,
	                emitter = new _emitter2['default']();

	            var paste = function paste(e) {
	                if (e.isDefaultPrevented()) {
	                    return;
	                }

	                var clipboardData = (e.originalEvent || e).clipboardData || window.clipboardData,
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
	                        file = new _file2['default'](runtime, files[i]);

	                        prevent = 1;

	                        addRet = context.add(file);
	                        if (addRet < 0 || addRet > 0 && !context.isMultiple()) {
	                            break;
	                        }
	                    }
	                } else if (items && items.length) {
	                    // chrome has items
	                    var filename = clipboardData.getData('text/plain');
	                    for (i = 0, l = items.length; i < l && !context.isLimit(); i++) {
	                        item = items[i];

	                        if (item.kind !== 'file' || !(file = item.getAsFile())) {
	                            continue;
	                        }

	                        file = new _file2['default'](runtime, file, filename);
	                        filename = null;

	                        prevent = 1;

	                        addRet = context.add(file);
	                        if (addRet < 0 || addRet > 0 && !context.isMultiple()) {
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

	            if ('DataTransfer' in window && 'FileList' in window) {
	                area.on('paste', paste);
	            }

	            emitter.destroy = function () {
	                emitter.removeAllListeners();
	                area.off('paste', paste);
	            };

	            return emitter;
	        }
	    }]);

	    return PasteCollector;
	})();

	exports['default'] = PasteCollector;
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _jquery = __webpack_require__(3);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _emitter = __webpack_require__(2);

	var _emitter2 = _interopRequireDefault(_emitter);

	var _html5Runtime = __webpack_require__(10);

	var _html5Runtime2 = _interopRequireDefault(_html5Runtime);

	var _flashRuntime = __webpack_require__(16);

	var _flashRuntime2 = _interopRequireDefault(_flashRuntime);

	var _file = __webpack_require__(13);

	var _file2 = _interopRequireDefault(_file);

	var SWF_URL = '';

	var FlashTriggerCollection = (function () {
	    function FlashTriggerCollection(context, onFiles) {
	        var _this = this;

	        _classCallCheck(this, FlashTriggerCollection);

	        var overlay = (0, _jquery2['default'])('<label></label>');
	        overlay.css({
	            position: 'fixed',
	            opacity: 0,
	            left: -100,
	            top: -100,
	            width: 50,
	            height: 50,
	            display: 'block',
	            cursor: 'pointer',
	            background: 'black',
	            overflow: 'hidden',
	            zIndex: 99999
	        });
	        var runtime = new _flashRuntime2['default'](overlay, SWF_URL, function () {
	            return {
	                accept: context.getAccept(),
	                multiple: context.isMultiple()
	            };
	        });

	        runtime.on('select', function (e) {
	            onFiles(e.files, runtime);
	            _this.current && _this.current.emit('files', e.files, runtime);
	        });

	        runtime.on('rollOut', function () {
	            return _this.hideOverlay();
	        });
	        this.overlay = overlay.appendTo(document.body);
	    }

	    _createClass(FlashTriggerCollection, [{
	        key: 'hideOverlay',
	        value: function hideOverlay() {
	            this.overlay.css({
	                left: -100,
	                top: -100,
	                width: 50,
	                height: 50
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
	                emitter = new _emitter2['default']();
	            trigger = trigger.on ? trigger : (0, _jquery2['default'])(trigger);
	            trigger.on('mouseover.flashpicker', function (e) {
	                var rect = e.currentTarget.getBoundingClientRect();
	                overlay.css({
	                    left: rect.left,
	                    top: rect.top,
	                    width: rect.right - rect.left,
	                    height: rect.bottom - rect.top
	                });
	                emitter.emit('rollOver');
	                if (_this2.current && _this2.current !== emitter) {
	                    _this2.current.emit('rollOut');
	                }
	                _this2.current = emitter;
	            });

	            emitter.destroy = function () {
	                if (_this2.current === emitter) {
	                    _this2.hideOverlay();
	                }
	                emitter.removeAllListeners();
	                trigger.off('mouseover.flashpicker');
	            };

	            return emitter;
	        }
	    }]);

	    return FlashTriggerCollection;
	})();

	var Html5TriggerCollection = (function () {
	    function Html5TriggerCollection(context, onFiles) {
	        var _this3 = this;

	        _classCallCheck(this, Html5TriggerCollection);

	        var runtime = _html5Runtime2['default'].getInstance();

	        this._createInput = function (label) {
	            var input = (0, _jquery2['default'])(document.createElement('input'));

	            input.attr('type', 'file');
	            input.css({
	                position: 'absolute',
	                clip: 'rect(1px 1px 1px 1px)'
	            });

	            var accept = context.getAccept();
	            if (accept && accept.length > 0) {
	                accept = accept.map(function (item) {
	                    return item.mimeTypes || '.' + item.extensions.join(',.');
	                });

	                input.attr('accept', accept.join(','));
	            }
	            if (context.isMultiple()) {
	                input.attr('multiple', 'multiple');
	            }

	            input.on('change', function (e) {
	                onFiles(e.target.files, runtime);
	                input.remove();
	                _this3._createInput(label);
	            });
	            label.html(input);
	        };
	    }

	    _createClass(Html5TriggerCollection, [{
	        key: 'add',
	        value: function add(trigger) {
	            var label = (0, _jquery2['default'])('<label></label>'),
	                emitter = new _emitter2['default']();
	            label.css({
	                position: 'absolute',
	                opacity: 0,
	                top: 0, left: 0,
	                width: '100%',
	                height: '100%',
	                display: 'inline-block',
	                cursor: 'pointer',
	                background: '#fff',
	                overflow: 'hidden'
	            });
	            this._createInput(label);
	            trigger = trigger.append ? trigger : (0, _jquery2['default'])(trigger);
	            trigger.append(label);

	            emitter.destroy = function () {
	                emitter.removeAllListeners();
	                label.remove();
	            };

	            return emitter;
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

	    function PickerCollector(context) {
	        _classCallCheck(this, PickerCollector);

	        var onFiles = function onFiles(files, runtime) {
	            for (var i = 0, l = files.length; i < l; i++) {
	                if (context.add(new _file2['default'](runtime, files[i])) < 0) {
	                    break;
	                }
	            }
	        };

	        if ('DataTransfer' in window && 'FileList' in window) {
	            this.triggerCollection = new Html5TriggerCollection(context, onFiles);
	        } else {
	            this.triggerCollection = new FlashTriggerCollection(context, onFiles);
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

	exports['default'] = PickerCollector;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _runtime = __webpack_require__(11);

	var _runtime2 = _interopRequireDefault(_runtime);

	var _transport = __webpack_require__(17);

	var _transport2 = _interopRequireDefault(_transport);

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
	function guid(_x4) {
	    var _again2 = true;

	    _function2: while (_again2) {
	        var prefix = _x4;
	        ret = undefined;
	        _again2 = false;

	        var ret = prefix + (_guid++).toString(16);
	        if (ret in window) {
	            _x4 = prefix;
	            _again2 = true;
	            continue _function2;
	        }
	        return ret;
	    }
	}

	var FlashRuntime = (function (_Runtime) {
	    _inherits(FlashRuntime, _Runtime);

	    function FlashRuntime(trigger, swf, options) {
	        _classCallCheck(this, FlashRuntime);

	        _get(Object.getPrototypeOf(FlashRuntime.prototype), 'constructor', this).call(this);

	        var callInterface = guid('FlashRuntime');

	        this.callInterface = callInterface;
	        window[callInterface] = this;

	        this.options = options;

	        var _this = this;
	        function display() {
	            var w = trigger[0].offsetWidth,
	                h = trigger[0].offsetHeight,
	                flash = undefined;
	            if (!w || !h || !(flash = createFlash(swf, callInterface))) {
	                setTimeout(display, 1000);
	                return;
	            }

	            trigger.append(_this.flash = flash);
	        }

	        display();
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
	            return new _transport2['default'](this, name, blob, options);
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
	})(_runtime2['default']);

	exports['default'] = FlashRuntime;
	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _errors = __webpack_require__(6);

	var _jquery = __webpack_require__(3);

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
	            var i = (0, _jquery.Deferred)(),
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
	                return i.reject(new _errors.NetworkError(e.status, e.response));
	            };

	            var error = function error(e) {
	                if (e.id !== blob.id) return;
	                clean();
	                i.reject(new _errors.AbortError(e.message));
	            };
	            flashRuntime.on('uploadprogress', progress);
	            flashRuntime.on('uploadcomplete', complete);
	            flashRuntime.on('uploaderror', error);

	            // Timeout
	            var timeout = request.getTimeout();
	            if (timeout > 0) {
	                timeoutTimer = setTimeout(function () {
	                    abort();
	                    i.reject(new _errors.TimeoutError('timeout:' + timeout));
	                }, timeout);
	            }

	            try {
	                flashRuntime.send(request.getName(), blob, request.getUrl(), request.getParams().toString());
	            } catch (e) {
	                abort();
	                i.reject(new _errors.AbortError(e.message));
	            }

	            var ret = i.promise();
	            ret.abort = abort;

	            return ret;
	        }
	    }]);

	    return FlashTransport;
	})();

	exports['default'] = FlashTransport;
	module.exports = exports['default'];

/***/ }
/******/ ]);

    UXUploader['default'].setSWF(require.resolve('./flashpicker.swf#'));
    UXUploader['default'].Status = UXUploader.Status;
    UXUploader['default'].Events = UXUploader.Events;

    module.exports = UXUploader['default'];
});