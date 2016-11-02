const {parseSize} = require('./util');

class ChunkResponse {
    /**
     * @param {string|null} rawResponse
     * @param {ChunkRequest} chunkRequest
     */
    constructor(rawResponse, chunkRequest) {
        this.rawResponse = rawResponse;
        this.chunkRequest = chunkRequest;
    }

    getChunkRequest() {
        return this.chunkRequest;
    }

    getRawResponse() {
        return this.rawResponse;
    }

    getResponse() {
        return this.response || this.rawResponse;
    }

    getJson() {
        const response = this.getResponse();
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

    setResponse(response) {
        this.response = response;
        return this;
    }
}

class ChunkRequest {
    /**
     *
     * @param {int} index
     * @param {Blob} blob
     * @param {FileRequest} fileRequest
     */
    constructor(index, blob, fileRequest) {
        this.index = index || 0;
        this.fileRequest = fileRequest;
        this.blob = blob || fileRequest.getFile().source;
    }

    getName() {
        return this.fileRequest.getName();
    }

    getFile() {
        return this.fileRequest.getFile();
    }

    getBlob() {
        return this.blob;
    }

    getBlobName() {
        return this.isMultiChunk() ? (this.blob.name || 'blob') : this.getFile().name;
    }

    getIndex() {
        return this.index;
    }

    isMultiChunk() {
        return this.getFile().source !== this.blob;
    }

    getParams() {
        if (!this.params) {
            this.params = this.fileRequest.getParams().clone();
        }
        return this.params;
    }

    getParam(name) {
        return this.getParams().getParam(name);
    }

    setParam(name, value) {
        this.getParams().setParam(name, value);

        return this;
    }

    getFileRequest() {
        return this.fileRequest;
    }

    getUrl() {
        return this.url || this.fileRequest.getUrl();
    }

    setUrl(url) {
        this.url = url;
        return this;
    }

    getHeaders() {
        if (!this.headers) {
            this.headers = this.fileRequest.getHeaders().slice(0);
        }
        return this.headers;
    }

    setHeader(name, value) {
        var headers = this.getHeaders();
        headers.push({name: name, value: value});
        return this;
    }

    isWithCredentials() {
        return this.fileRequest.isWithCredentials();
    }

    getTimeout() {
        return this.fileRequest.getTimeout();
    }

    createChunkResponse(response) {
        return new ChunkResponse(response, this);
    }
}

class FileResponse {
    /**
     * @param {ChunkResponse|Object|string} rawResponse
     * @param {FileRequest} fileRequest
     */
    constructor(rawResponse, fileRequest) {
        this.rawResponse = rawResponse;
        this.fileRequest = fileRequest;
    }

    isFromMultiChunkResponse() {
        if (this.rawResponse instanceof ChunkResponse) {
            return this.rawResponse.getChunkRequest().isMultiChunk();
        }
        return false;
    }

    getFileRequest() {
        return this.fileRequest;
    }

    getRawResponse() {
        return this.rawResponse;
    }

    getResponse() {
        if (this.response != null) {
            return this.response;
        }
        if (this.rawResponse instanceof ChunkResponse) {
            return this.rawResponse.getResponse();
        } else {
            return this.rawResponse;
        }
    }

    getJson() {
        const response = this.getResponse();
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

    setResponse(response) {
        this.response = response;
        return this;
    }
}

class Params {
    constructor(params) {
        if (Array.isArray(params)) {
            this.params = params.slice(0);
        } else if (typeof params === 'object') {
            this.params = [];
            for (let name in params) {
                if (params.hasOwnProperty(name)) {
                    this.params.push({name, value: params[name]});
                }
            }
        } else {
            this.params = [];
        }
    }

    setParam(name, value) {
        this.removeParam(name);
        this.addParam(name, value);
    }

    addParam(name, value) {
        this.params.push({name, value});
    }

    removeParam(name) {
        this.params = this.params.filter((param) => param.name !== name);
    }

    getParam(name, single) {
        let ret = this.params.filter((param) => param.name === name)
            .map((param) => param.value);

        if (single) {
            return ret.shift();
        }

        return ret;
    }

    clone() {
        return new Params(this.params);
    }

    toArray() {
        return this.params;
    }

    toString() {
        const params = this.params.map((param) => {
            return encodeURIComponent(param.name) + '=' + (param.value == null ? '' : encodeURIComponent(param.value));
        });

        return params.join('&'); //.replace( /%20/g, '+');
    }
}

const MIN_CHUNK_SIZE = 256 * 1024; // 256K

class FileRequest {
    constructor(file, options = {}) {
        this.file = file;
        this.name = options.name || 'file';
        this.url = options.url || options.action;
        this.params = new Params(options.params || options.data);
        this.headers = options.headers || [];
        this.withCredentials = options.withCredentials;
        this.timeout = options.timeout || 0;
        this.chunkSize = options.chunkSize || 0;
        this.chunkRetries = options.chunkRetries || 0;
        this.chunkEnable = options.chunkEnable || false;
        this.chunkProcessThreads = options.chunkProcessThreads || 2;
    }

    getFile() {
        return this.file;
    }

    getUrl() {
        return this.url || '';
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setUrl(url) {
        this.url = url;
        return this;
    }

    getParams() {
        return this.params;
    }

    getParam(name) {
        return this.getParams().getParam(name);
    }

    setParam(name, value) {
        this.params.setParam(name, value);
        return this;
    }

    getHeaders() {
        return this.headers;
    }

    setHeader(name, value) {
        this.headers.push({name: name, value: value});
    }

    isWithCredentials() {
        return this.withCredentials;
    }

    setWithCredentials(flag) {
        this.withCredentials = flag;
        return this;
    }

    getTimeout() {
        return this.timeout;
    }

    setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }

    getChunkSize() {
        return parseSize(this.chunkSize);
    }

    setChunkSize(chunkSize) {
        this.chunkSize = chunkSize;
        return this;
    }

    getChunkRetries() {
        return this.chunkRetries;
    }

    setChunkRetries(retries) {
        this.chunkRetries = retries;
        return 0;
    }

    isChunkEnable() {
        const chunkSize = this.getChunkSize();
        return this.chunkEnable && chunkSize > MIN_CHUNK_SIZE
            && this.file.getRuntime().canSlice() && this.file.size > chunkSize;
    }

    setChunkEnable(flag) {
        this.chunkEnable = flag;
        return this;
    }

    getChunkProcessThreads() {
        return this.chunkProcessThreads;
    }

    setChunkProcessThreads(threads) {
        this.chunkProcessThreads = threads;
        return this;
    }

    createChunkRequest(index, blob) {
        return new ChunkRequest(index, blob, this);
    }

    createFileResponse(response) {
        return new FileResponse(response, this);
    }
}

module.exports = FileRequest;