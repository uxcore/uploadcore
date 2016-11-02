const {Deferred} = require('../util');
const {TimeoutError, AbortError, NetworkError} = require('../errors');

class Html5Transport {
    /**
     * @param {ChunkRequest} request
     * @returns {*}
     */
    generate(request) {
        const i = Deferred();
        const xhr = new XMLHttpRequest;

        let timeoutTimer;

        const clean = () => {
            xhr.onload = xhr.onerror = null;
            if (xhr.upload) {
                xhr.upload.onprogress = null;
            }
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }
        };

        const abort = () => {
            clean();
            try {
                xhr.abort();
            } catch (e) {}
        };

        const complete = (e) => {
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
            xhr.upload.onprogress = (e) => i.notify(e);
        }
        xhr.onerror = complete;
        xhr.onload = complete;

        // Timeout
        const timeout = request.getTimeout();
        if (timeout > 0) {
            timeoutTimer = setTimeout(() => {
                abort();
                i.reject(new TimeoutError('timeout:'+timeout));
            }, timeout);
        }

        try {
            xhr.open('POST', request.getUrl(), true);
            if (request.isWithCredentials()) {
                xhr.withCredentials = true;
            }

            request.getHeaders().forEach((header) => xhr.setRequestHeader(header.name, header.value));

            const formData = new FormData;

            request.getParams().toArray().forEach((param) => formData.append(param.name, param.value));

            formData.append(request.getName(), request.getBlob(), request.getBlobName());

            xhr.send(formData);
        } catch (e) {
            abort();
            i.reject(new AbortError(e.message));
        }

        const ret = i.promise();
        ret.abort = abort;

        return ret;
    }
}

module.exports = Html5Transport;