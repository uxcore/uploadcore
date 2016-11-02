const Emitter = require('./emitter');
const Events = require('./events');
const {Deferred} = require('./util');
const {NetworkError} = require('./errors');

class Runtime extends Emitter {
    md5(blob) {
        var i = Deferred();
        i.reject();
        return i.promise();
    }
    getAsDataUrl(file, timeout) {
        var i = Deferred();
        i.reject();
        return i.promise();
    }
    getTransport() {
        return null;
    }
    getUploading() {
        if (!this.uploading) {
            this.uploading = new Uploading(this);
        }
        return this.uploading;
    }
    canSlice() {
        return false;
    }
    slice(blob) {
        throw new Error('this runtime current not support slice');
    }

    cancel(blob) {

    }
}

module.exports = Runtime;

class Uploading {
    constructor(runtime) {
        this.runtime = runtime;
    }

    /**
     * @param {FileRequest} request
     * @returns {*}
     */
    generate(request) {
        const i = Deferred(),
            file = request.getFile(),
            runtime = this.runtime;

        let source = file.getSource(), size = file.size,
            chunkSize = request.getChunkSize(),
            useChunk = request.isChunkEnable(),
            threads = Math.max(request.getChunkProcessThreads(), 1),
            start = 0, end = 0, slots = [];

        const getActives = () => {
            return slots.reduce((sum, slot) => sum + (slot.state() === 'pending' ? 1 : 0), 0);
        };

        const readChunk = () => {
            let slot, req, blob;
            while (end < size && getActives() < threads) {
                start = end;
                end = Math.min(end + chunkSize, size);
                blob = runtime.slice(source, start, end);
                req = request.createChunkRequest(slots.length, blob);
                req.setHeader('Content-Range', 'bytes ' + start + '-' + (end - 1) + '/' + size);
                slot = this.slot(req, request.getChunkRetries());
                slot.progress(progress).done(done).fail(fail);
                slots.push(slot);
            }
        };

        const progress = () => {
            let total = size - end, loaded = 0;
            slots.forEach((slot) => {
                total += slot.total;
                loaded += slot.loaded;
            });
            i.notify({total, loaded});
        };

        const done = (res) => {
            useChunk && readChunk();

            if (end >= size && slots.every((slot) => slot.state() === 'resolved')) {
                i.resolve(res);
            }
        };

        const abort = () => {
            slots.forEach((slot) => slot.abort());
        };

        const fail = (error) => {
            i.reject(error);
            abort();
        };

        if (useChunk) {
            readChunk();
        } else {
            end = size;
            let slot = this.slot(request.createChunkRequest(), 0);
            slot.progress(progress).done(done).fail(fail);
            slots.push(slot);
        }

        let ret = i.promise();
        ret.abort = abort;

        return ret;
    }

    slot(request, retries) {
        let i = Deferred(),
            runtime = this.runtime,
            core = request.getFile().getCore();

        let ret = i.promise();

        const progress = (e) => {
            if (e.total) {
                ret.total = e.total;
            }
            if (e.loaded) {
                ret.loaded = e.loaded;
            }
            i.notify(e);
        };

        const process = () => {
            var prepare, transport, completion;
            ret.abort = function () {
                prepare && prepare.abort();
                transport && transport.abort();
                completion && completion.abort();
            };
            ret.total = request.getBlob().size;
            ret.loaded = 0;

            prepare = core.invoke(Events.CHUNK_UPLOAD_PREPARING, request);

            prepare.then((request) => {
                transport = runtime.getTransport().generate(request);
                transport.progress(progress);
                return transport;
            }).then((response) => {
                completion = core.invoke(Events.CHUNK_UPLOAD_COMPLETING, request.createChunkResponse(response));
                return completion;
            }).done(i.resolve).fail(error);
        };

        const error = (e) => {
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
}

