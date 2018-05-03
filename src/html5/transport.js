const toBuffer = require('blob-to-buffer');
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
      } catch (e) {
      }
    };

    const complete = (e) => {
      clean();
      if (!xhr.status && e.type === 'error') {
        return i.reject(new AbortError(e.message));
      }
      if (xhr.status === 0 || xhr.status === 304 || xhr.status >= 200 && xhr.status < 300) {
        const headers = xhr.getAllResponseHeaders().split(/\r?\n/);
        const res = {
          responseText: xhr.responseText,
          headers: {},
        };
        headers.forEach(function (header) {
          const matches = header.match(/^([^:]+):\s*(.*)/);
          if (matches) {
            const key = matches[1].toLowerCase();
            if (key === 'set-cookie') {
              if (res.headers[key] === undefined) {
                res.headers[key] = []
              }
              res.headers[key].push(matches[2])
            } else if (res.headers[key] !== undefined) {
              res.headers[key] += ', ' + matches[2]
            } else {
              res.headers[key] = matches[2]
            }
          }
        });
        return i.resolve(res);
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
        i.reject(new TimeoutError('timeout:' + timeout));
      }, timeout);
    }

    try {
      if (request.isWithCredentials() && 'withCredentials' in xhr) {
        xhr.open(request.getMethod(), request.getUrl(), true);
        xhr.withCredentials = true;
      } else {
        xhr.open(request.getMethod(), request.getUrl());
      }

      request.getHeaders().forEach((header) => xhr.setRequestHeader(header.name, header.value));

      if (request.getSendAsBinary()) {// 传输二进制数据
        // 转换blob 为 arrayBuffer
        toBuffer(request.getBlob(), (err, buffer) => {
          if (err) throw err;
          xhr.send(buffer);
        })
      } else {
        const formData = new FormData;

        request.getParams().toArray().forEach((param) => formData.append(param.name, param.value));

        formData.append(request.getName(), request.getBlob(), request.getBlobName());

        xhr.send(formData);
      }

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