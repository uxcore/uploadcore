const {Deferred} = require('../util');
const {TimeoutError, AbortError, NetworkError} = require('../errors');

class FlashTransport {
    constructor(flashRuntime) {
        this.flashRuntime = flashRuntime;
    }

    /**
     * @param {ChunkRequest} request
     * @returns {*}
     */
    generate(request) {
        const i = Deferred(), flashRuntime = this.flashRuntime, blob = request.getBlob();

        let timeoutTimer;

        const clean = () => {
            flashRuntime.off('uploadprogress', progress);
            flashRuntime.off('uploadcomplete', complete);
            flashRuntime.off('uploaderror', error);
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }
        };
        const abort = () => {
            clean();
            flashRuntime.abort(blob.id);
        };

        const progress = (e) => {
            if (e.id !== blob.id) return;
            i.notify(e);
        };

        const complete = (e) => {
            if (e.id !== blob.id) return;
            clean();
            if (e.status === 304 || e.status >= 200 && e.status < 300) {
                flashRuntime.cancel(blob);
                return i.resolve(e.response);
            }
            return i.reject(new NetworkError(e.status, e.response));
        };

        const error = (e) => {
            if (e.id !== blob.id) return;
            clean();
            i.reject(new AbortError(e.message));
        };
        flashRuntime.on('uploadprogress', progress);
        flashRuntime.on('uploadcomplete', complete);
        flashRuntime.on('uploaderror', error);

        // Timeout
        const timeout = request.getTimeout();
        if (timeout > 0) {
            timeoutTimer = setTimeout(() => {
                abort();
                i.reject(new TimeoutError('timeout:'+timeout));
            }, timeout);
        }

        try {
            flashRuntime.send(request.getName(), blob, request.getUrl(), request.getParams().toString());
        } catch (e) {
            abort();
            i.reject(new AbortError(e.message));
        }

        const ret = i.promise();
        ret.abort = abort;

        return ret;
    }
}

module.exports = FlashTransport;