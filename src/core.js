const Emitter = require('./emitter');
const Events = require('./events');
const {Status} = require('./status');
const {QueueLimitError, FilterError, DuplicateError, FileExtensionError, FileSizeError} = require('./errors');
const {formatSize, parseSize, normalizeAccept} = require('./util');
const FileRequest = require('./filerequest');
const DndCollector = require('./collector/dnd');
const PasteCollector = require('./collector/paste');
const PickerCollector = require('./collector/picker');

const REQUEST_OPTIONS = ['name', 'url', 'params', 'action', 'data', 'headers', 'withCredentials', 'timeout', 'chunkEnable', 'chunkSize', 'chunkRetries', 'chunkProcessThreads'];

class Core extends Emitter {

    constructor(options = {}) {
        super();

        this.autoPending = options.autoPending || options.auto;
        this.capcity = options.capcity || options.queueCapcity || 0;
        this.multiple = options.multiple == null ? true : options.multiple;

        this.accept = normalizeAccept(options.accept);
        this.sizeLimit = parseSize(options.sizeLimit || options.fileSizeLimit || 0);

        this.pending = new Pending(options.processThreads);
        this.stat = new Stat;
        this.constraints = new Constraints;
        this.filters = new Filters;

        this.addConstraint(() => {
            if (this.capcity > 0) {
                return this.stat.getTotal() >= this.capcity
            }
            else {
                return false;
            }
        });

        if (this.accept && this.accept.length > 0) {
            this.addFilter((file) => {
                if (!this.accept.some((item) => {
                    return item.extensions && item.extensions.indexOf(file.ext) > -1
                }))
                {
                    return new FileExtensionError(file, 'extension "' + file.ext + '" is not allowed');
                }
            });
        }

        if (this.sizeLimit > 0) {
            this.addFilter((file) => {
                if (file.size > this.sizeLimit) {
                    return new FileSizeError(file, 'filesize:' + formatSize(file.size) + ' is greater than limit:' + formatSize(this.sizeLimit));
                }
            });
        }

        if (options.preventDuplicate) {
            this.addFilter((file) => {
                if (this.stat.getFiles().some((item) => item.name === file.name && item.size === file.size)) {
                    return new DuplicateError(file, 'file "' + file.name + '" already in queue');
                }
            });
        }

        if (Array.isArray(options.filters)) {
            options.fitlers.forEach(filter => this.addFilter(filter));
        }

        let request = options.request || {};
        REQUEST_OPTIONS.forEach((key) => {
            if (options.hasOwnProperty(key)) {
                request[key] = options[key];
            }
        });

        this.requestOptions = request;
    }

    setOptions(options) {
        if (typeof options === 'object' && !(options instanceof Array)) {
            this.autoPending = options.autoPending || options.auto || this.autoPending;
            this.capcity = options.capcity || options.queueCapcity || this.capcity;
            this.sizeLimit = parseSize(options.sizeLimit || options.fileSizeLimit || this.sizeLimit);
            let requestOptions = this.requestOptions
            REQUEST_OPTIONS.forEach((key) => {
                if (options.hasOwnProperty(key)) {
                    requestOptions[key] = options[key];
                }
            });
        }
        else {
            console && console.error('setOptions: type error, options should be an object/hashMap');
        }
    }

    createFileRequest(file) {
        return new FileRequest(file, this.requestOptions);
    }

    isLimit() {
        return this.constraints.some();
    }

    addConstraint(constraint) {
        return this.constraints.add(constraint);
    }

    addFilter(filter) {
        return this.filters.add(filter);
    }

    add(file) {
        if (this.isLimit()) {
            this.emit(Events.QUEUE_ERROR, new QueueLimitError);
            return -1;
        }

        let error = this.filters.filter(file);
        if (!error && !this.stat.add(file)) {
            error = new DuplicateError(file, 'file "' + file.name + '" already in queue');
        }

        if (error) {
            this.emit(Events.QUEUE_FILE_FILTERED, file, error);
            this.emit(Events.QUEUE_ERROR, error);
            return 0;
        }

        file.setStatus(Status.QUEUED);

        file.on(Events.FILE_STATUS_CHANGE, (status) => {
            if (status === Status.CANCELLED) {
                this.stat.remove(file);
            } else if (status === Status.PENDING) {
                setTimeout(() => {
                    if (this.pending.add(file) && this.pending.size() === 1) {
                        this.emit(Events.QUEUE_UPLOAD_START);
                    }
                }, 1);
            }

            this.emit(Events.QUEUE_STAT_CHANGE, this.stat);

            if (this.stat.getFiles(Status.PROCESS).length < 1) {
                this.emit(Events.QUEUE_UPLOAD_END);
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

    isMultiple() {
        return this.multiple;
    }

    isFull() {
        return this.capcity > 0 && this.getTotal() >= this.capcity;
    }

    isEmpty() {
        return this.getTotal() < 1;
    }

    getAccept() {
        return this.accept;
    }

    getStat() {
        return this.stat;
    }

    getTotal() {
        return this.getStat().getTotal();
    }

    getFiles(flag) {
        return this.getStat().getFiles(flag);
    }

    stat(flag) {
        return this.getStat().stat(flag);
    }

    static setSWF(url) {
        PickerCollector.setSWF(url);
    }

    getPickerCollector() {
        if (!this.picker) {
            this.picker = new PickerCollector(this);
        }
        return this.picker;
    }

    getDndCollector() {
        if (!this.dnd) {
            this.dnd = new DndCollector(this);
        }
        return this.dnd;
    }

    getPasteCollector() {
        if (!this.paster) {
            this.paster = new PasteCollector(this);
        }
        return this.paster;
    }
}

module.exports = Core;

class Set {
    constructor() {
        this._set = [];
    }

    /**
     * 项目总数
     *
     * @returns {Number}
     */
    size() {
        return this._set.length;
    }

    /**
     * 从头部取出一项
     *
     * @returns {*}
     */
    shift() {
        return this._set.shift();
    }

    /**
     * 从尾部取出一项
     *
     * @returns {*}
     */
    pop() {
        return this._set.pop();
    }

    /**
     * 获得所有项
     *
     * @returns {Array}
     */
    toArray() {
        return this._set.slice(0);
    }

    /**
     * 添加一项
     *
     * @param item
     * @returns {boolean} success if true
     */
    add(item) {
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
    has(item) {
        return this._set.indexOf(item) > -1;
    }

    /**
     * 删除某项
     *
     * @returns {boolean} success if true
     */
    remove(item) {
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
    clear() {
        this._set = [];
    }
}

class Stat {
    constructor() {
        this.files = new Set;
    }
    add(file) {
        return this.files.add(file);
    }
    remove(file) {
        this.files.remove(file);
    }
    getTotal() {
        return this.files.size();
    }
    getFiles(flag) {
        var files = this.files.toArray();
        if (!flag) {
            return files;
        }
        return files.filter((file) => {
            return !!(file.getStatus() & flag);
        });
    }
    stat(flag) {
        let ret = {}, files = this.getFiles(flag);

        files.forEach((file) => {
            let status = file.getStatus();
            ret[status] = (status in ret) ?  (ret[status] + 1) : 1;
        });

        ret['sum'] = files.length;

        return ret;
    }
}

class Constraints {
    constructor() {
        this.constraints = new Set;
    }

    add(constraint) {
        this.constraints.add(constraint);
        return this;
    }

    remove(constraint) {
        this.constraints.remove(constraint);
        return this;
    }

    some() {
        return this.constraints.toArray().some((fn) => fn.call(this));
    }
}

class Filters {
    constructor() {
        this.filters = new Set;
    }

    add(filter) {
        this.filters.add(filter);
        return this;
    }

    remove(filter) {
        this.filters.remove(filter);
        return this;
    }

    filter(file) {
        let error = null;
        this.filters.toArray().every((filter) => {
            let ret;
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
}

class Pending {
    constructor(threads) {
        this.threads = threads || 2;
        this.heading = new Set;
        this.pending = new Set;
    }

    add(file) {
        if (!this.pending.add(file)) return false;

        file.session().always(() => this.pending.remove(file));

        this.load();

        return true;
    }

    size() {
        return this.pending.size() + this.heading.size();
    }

    process(file) {
        if (!this.heading.add(file)) return;

        file.session().always(() => {
            this.heading.remove(file);
            this.load();
        });
    }

    load () {
        var file;
        while (this.heading.size() < this.threads && (file = this.pending.shift())) {
            if (file.prepare()) {
                this.process(file);
            }
        }
    }
}
