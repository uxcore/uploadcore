import Emitter from './emitter';
import Events from './events';
import Status from './status';
import {QueueLimitError, DuplicateError, FileExtensionError, FileSizeError} from './errors';
import FileRequest from './filerequest';
import DndCollector from './collector/dnd';
import PasteCollector from './collector/paste';
import PickerCollector from './collector/picker';

export default class Context extends Emitter {

    constructor(options) {
        super();

        let {processThreads, autoPending, queueCapcity, accept, sizeLimit, preventDuplicate, multiple} = options;

        this.stat = new Stat;
        this.limiter = new Limiter;
        this.filter = new Filter;
        this.accept = accept;
        this.autoPending = autoPending;
        this.multiple = multiple == null ? true : multiple;
        this.pending = new Pending(processThreads);

        if (queueCapcity && queueCapcity > 0) {
            this.addLimit(() => this.stat.getTotal() >= queueCapcity);
        }

        if (accept && accept.length > 0) {
            this.addFilter((file) => {
                if (!accept) {
                    return;
                }
                let allowed = accept.some((item) => {
                    return item.extensions && item.extensions.split(',').indexOf(file.ext) > -1
                });
                if (allowed) {
                    return;
                }
                return new FileExtensionError(file, file.ext + ' is not allowed.');
            });
        }

        if (sizeLimit && sizeLimit > 0) {
            this.addFilter((file) => {
                if (file.size > sizeLimit) {
                    return new FileSizeError(file, file.size + ' is greater than limit:' + sizeLimit);
                }
            });
        }

        if (preventDuplicate) {
            this.addFilter((file) => {
                let has = this.stat.getFiles().some((item) => item.name === file.name && item.size === file.size);
                if (has) {
                    return new DuplicateError(file, file.name + ' already in queue');
                }
            });
        }

        this.requestOptions = options.request || {};
    }

    createFileRequest(file) {
        return new FileRequest(file, this.requestOptions);
    }

    isLimit() {
        return this.limiter.isLimit();
    }

    addLimit(limit) {
        return this.limiter.add(limit);
    }

    addFilter(filter) {
        return this.filter.add(filter);
    }

    isAllow(file) {
        return this.filter.filter(file);
    }

    add(file) {
        if (this.isLimit()) {
            this.emit(Events.QUEUE_ERROR, new QueueLimitError);
            return false;
        }

        if (!this.isAllow(file)) {
            this.emit(Events.QUEUE_ERROR, this.filter.getError());
            return false;
        }

        if (!this.stat.add(file)) {
            this.emit(Events.QUEUE_ERROR, new DuplicateError(file, file.name + ' already in queue'));
            return false;
        }

        file.setContext(this);
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

        this.emit(Events.QUEUE_ADD, file);

        this.emit(Events.QUEUE_STAT_CHANGE, this.stat);

        if (this.autoPending) {
            file.pending();
        }

        return true;
    }

    /**
     * 设置自动上传
     *
     * @param {Boolean} flag
     */
    setAutoPending(flag) {
        this.autoPending = flag;
        if (this.autoPending) {
            this.stat.getFiles(Status.QUEUED).forEach((file) => file.pending());
        }
    }

    /**
     * 设置是否多选上传
     *
     * @param {Boolean} flag
     */
    setMultiple(flag) {
        this.multiple = flag;
    }

    isMultiple() {
        return this.multiple;
    }

    getAccept() {
        return this.accept;
    }

    getStat() {
        return this.stat;
    }

    setSWF(url) {
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


class Set {
    constructor() {
        this._set = [];
    }

    /**
     * 项目总数
     *
     * @returns {Number}
     */
    get size() {
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
        return this.files.size;
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
        let stat = {}, files = this.getFiles(flag);

        files.forEach((file) => {
            let status = file.getStatus();
            stat[status] = (status in stat) ?  (stat[status] + 1) : 1;
        });

        stat['sum'] = files.length;

        return stat;
    }
}

class Limiter {
    constructor() {
        this.limits = new Set;
    }

    add(limit) {
        this.limits.add(limit);
        return this;
    }

    remove(limit) {
        this.limits.remove(limit);
        return this;
    }

    isLimit() {
        return this.limits.toArray().some((fn) => fn.call(this));
    }
}

class Filter {
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
        this.error = null;
        return this.filters.toArray().every((filter) => {
            let ret;
            try {
                ret = filter(file);
            } catch (e) {
                ret = e;
            }
            if (typeof ret === 'string') {
                this.error = new FilterError(file, ret);
                return false;
            } else if (ret instanceof Error) {
                this.error = ret instanceof FilterError ? ret : new FilterError(file, ret.toString());
                return false;
            }
            return true;
        });
    }

    getError() {
        return this.error;
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
        return this.pending.size + this.heading.size;
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
        while (this.heading.size < this.threads && (file = this.pending.shift())) {
            if (file.prepare()) {
                this.process(file);
            }
        }
    }
}
