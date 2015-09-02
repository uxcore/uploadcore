import {Deferred} from 'jquery';
import Aspects from './fileaspects';
import {NetworkError} from './errors';

export default class FileUploading {
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
            threads = request.getChunkProcessThreads(),
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
            let slot = this.slot(request.createChunkRequest(0, source), 0);
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
            context = request.getFile().getContext();

        let slot = i.promise();

        const error = (e) => {
            if (e instanceof NetworkError && retries-- > 0) {
                // retry
                setTimeout(process, 500);
            } else {
                i.reject(e);
            }
            slot.abort();
        };

        const progress = (e) => {
            if (e.total) {
                slot.total = e.total;
            }
            if (e.loaded) {
                slot.loaded = e.loaded;
            }
            i.notify(e);
        };

        const process = () => {
            var prepare, transport, completion;
            slot.abort = function () {
                prepare && prepare.abort();
                transport && transport.abort();
                completion && completion.abort();
            };
            slot.total = request.getBlob().size;
            slot.loaded = 0;

            prepare = context.aspect(Aspects.CHUNK_PREPARE).invoke(request);

            prepare.then((request) => {
                transport = runtime.getTransport().generate(request);
                transport.progress(progress);
                return transport;
            }).then((response) => {
                completion = context.aspect(Aspects.CHUNK_COMPLETE).invoke(request.createChunkResponse(response));
                return completion;
            }).done(i.resolve).fail(error);
        };

        process();

        return slot;
    }
}
