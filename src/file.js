const Emitter = require('./emitter');
const Events = require('./events');
const {Deferred} = require('./util');
const {Status, StatusName} = require('./status');

let uid = 0;
function guid() {
    return 'FILE-' + (uid++).toString(16).toUpperCase();
}

const RE_EXT = /\.([^.]+)$/, RE_IMAGE = /^image\/(jpg|jpeg|png|gif|bmp|webp)$/i;
function guessExt(blob) {
    let m = blob.name && RE_EXT.exec(blob.name);
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
    if (['jpg','jpeg','png','gif','bmp','webp'].indexOf(ext.toLowerCase()) > -1) {
        return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
    }
    return null;
}

class Progress {
    constructor(total, loaded) {
        this.change(total, loaded);
    }

    change(total, loaded) {
        this.total = total;
        this.loaded = loaded || 0;
        this.percentage = this.loaded === this.total ? 100 : Math.ceil(this.loaded / this.total * 100)
    }

    done() {
        this.change(this.total, this.total);
    }
}

class File extends Emitter {
    constructor(runtime, source, filename) {
        super();

        this.id = guid();

        this.name = source.name || filename || this.id;

        var ext = guessExt(source).toLowerCase();

        if (ext && !RE_EXT.test(this.name)) {
            this.name += '.' + ext;
        }

        this.ext = ext;

        this.type = source.type || guessType(this.ext) || 'application/octet-stream';

        this.lastModified = source.lastModified || (+new Date);

        this.size = source.size || 0;

        this.runtime = runtime;

        this.source = source;

        this.status = Status.INITED;

        this.progress = new Progress(this.size, 0);
    }

    getCore() {
        return this.core;
    }

    setCore(core) {
        this.core = core;
        this.setPropagationTarget(core);
    }

    getRuntime() {
        return this.runtime;
    }

    isImage() {
        return RE_IMAGE.test(this.type);
    }

    setStatus(status, silent) {
        let prevStatus = this.status;

        if (prevStatus !== Status.CANCELLED && status !== prevStatus) {
            this.status = status;
            !silent && this.emit(Events.FILE_STATUS_CHANGE, status, prevStatus);
        }
    }

    getStatus() {
        return this.status;
    }

    getStatusName() {
        if (this.status in StatusName) {
            return StatusName[this.status];
        } else {
            return 'unknow';
        }
    }

    getSource() {
        return this.source;
    }

    getAsDataUrl(timeout) {
        if (!this._dataUrlPromise) {
            this._dataUrlPromise = this.runtime.getAsDataUrl(this.source, timeout);
        }
        return this._dataUrlPromise;
    }

    md5() {
        if (!this._md5Promise) {
            this._md5Promise = this.runtime.md5(this.source);
        }
        return this._md5Promise;
    }

    session() {
        if (this._sessionPromise) {
            return this._sessionPromise;
        }

        let ret = Deferred();

        ret.progress((progress) => {
            this.setStatus(Status.PROGRESS);
            this.emit(Events.FILE_UPLOAD_PROGRESS, progress);
        }).done((response) => {
            this.response = response;
            this._session = null;
            this._sessionPromise = null;
            this._flows = [];
            this.setStatus(Status.SUCCESS);
            this.emit(Events.FILE_UPLOAD_SUCCESS, response);
        }).fail((error) => {
            this._session = null;
            this._sessionPromise = null;
            let flow;
            while (flow = this._flows.shift()) {
                flow.abort();
            }

            if (error instanceof Error) {
                this.setStatus(Status.ERROR);
                this.emit(Events.FILE_UPLOAD_ERROR, error);
            }
        }).always(() => {
            this.emit(Events.FILE_UPLOAD_COMPLETED, this.getStatus());
        });

        this._flows = [];
        this._session = ret;
        this._sessionPromise = ret.promise();

        return this._sessionPromise;
    }

    prepare() {
        if (this.status !== Status.PENDING || !this.core) {
            return false;
        }

        this.session();
        this.setStatus(Status.PROGRESS);

        this.emit(Events.FILE_UPLOAD_START);

        this.request = this.core.createFileRequest(this);

        let ret = this.core.invoke(Events.FILE_UPLOAD_PREPARING, this.request);

        this._flows.push(ret);

        ret.then((request) => {
            this.emit(Events.FILE_UPLOAD_PREPARED, request);

            const upload = this.runtime.getUploading().generate(request);

            this._flows.push(upload);

            upload.progress((e) => {
                this.progress.change(e.total, e.loaded);
                this._session.notify(this.progress);
            });

            return upload;
        }).then((response) => this.complete(response), this._session.reject);

        return true;
    }

    complete(response) {
        if (this.status !== Status.PROGRESS) return;

        let flow;
        while (flow = this._flows.shift()) {
            flow.abort();
        }

        this.progress.done();
        this._session.notify(this.progress);

        response = this.request.createFileResponse(response);

        this.setStatus(Status.END);
        this.emit(Events.FILE_UPLOAD_END);

        let ret = this.core.invoke(Events.FILE_UPLOAD_COMPLETING, response);

        this._flows.push(ret);

        ret.then(this._session.resolve, this._session.reject);
    }

    pending() {
        if (this.status === Status.ERROR || this.status === Status.QUEUED) {
            this.progress.change(this.size, 0);
            this.setStatus(Status.PENDING);
        }
    }

    abort() {
        this._session && this._session.reject();
        this._session = null;
        this._sessionPromise = null;
    }

    cancel(silent) {
        this.setStatus(Status.CANCELLED, silent);
        !silent && this.emit(Events.FILE_CANCEL);
        this.abort();
        this.runtime.cancel(this.source);
        this._dataUrlPromise && this._dataUrlPromise.abort();
        this._md5Promise && this._md5Promise.abort && this._md5Promise.abort();
        this.removeAllListeners();
    }

    destroy() {
        this.cancel();
    }
}

module.exports = File;