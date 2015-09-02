import {TimeoutError, AbortError, NetworkError} from '../errors';
import {Deferred} from 'jquery';

export default class Html5Transport {
    constructor() {}

    /**
     * @param {ChunkRequest} request
     * @returns {*}
     */
    generate(request) {
        const i = Deferred();

        let timeoutTimer, withCredentials = false;
        let xhr = new XMLHttpRequest;

        if (request.isWithCredentials && !('withCredentials' in xhr) && ('XDomainRequest' in window)) {
            xhr = new XDomainRequest;
            withCredentials = true;
        }

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
            if (withCredentials) {
                xhr.open('POST', request.getUrl(), true);
                xhr.withCredentials = true;
            } else {
                xhr.open('POST', request.getUrl());
            }

            request.getHeaders().forEach((header) => xhr.setRequestHeader(header.name, header.value));

            const formData = new FormData, blob = request.getBlob();

            request.getParams().toArray().forEach((param) => formData.append(param.name, param.value));

            formData.append(request.getName(), blob, blob.name || 'blob');

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
