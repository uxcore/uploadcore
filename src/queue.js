import Emitter from './emitter';
import Set from './set';
import Events from './events';
import Status from './filestatus';
import FileFilter from './filefilter';
import FilePending from './filepending';
import {QueueLimitError, DuplicateError, FileExtensionError, FileSizeError} from './errors';

export default class Queue extends Emitter {
    /**
     * @param {Context} context
     * @param {Object} options
     */
    constructor(context, options = {}) {
        super();

        let {processThreads, autoPending, queueCapcity, accept, sizeLimit, preventDuplicate, multiple} = options;

        this.context = context;
        this.stat = new Stat;
        this.limits = new Set;
        this.filter = new FileFilter;
        this.accept = accept;
        this.autoPending = autoPending;
        this.multiple = multiple == null ? true : multiple;
        this.pending = new FilePending(processThreads);

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
    }

    isLimit() {
        return this.limits.toArray().some((fn) => fn.call(this));
    }

    addLimit(limit) {
        this.limits.add(limit);
        return () => {
            this.limits.remove(limit);
        };
    }

    addFilter(filter) {
        this.filter.add(filter);
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

        file.setContext(this.context);
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

        file.on(Events.FILE_UPLOAD_PROGRESS, () => {
            this.emit(Events.QUEUE_UPLOAD_PROGRESS);
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
