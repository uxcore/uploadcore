const Runtime = require('../runtime');
const {Deferred} = require('../util');
const Transport = require('./transport');

let instance;

class Html5Runtime extends Runtime {
    static getInstance() {
        if (!instance) {
            instance = new Html5Runtime;
        }
        return instance;
    }

    getAsDataUrl(blob, timeout) {
        let i = Deferred(),
            fr = new FileReader, timer;

        fr.onloadend = () => {
            if (fr.readyState == FileReader.DONE) {
                i.resolve(fr.result);
            } else {
                i.reject();
            }
            clearTimeout(timer);
            fr.onloadend = null;
        };
        fr.readAsDataURL(blob);

        let abort = () => {
            fr && fr.abort();
            fr = null;
        };
        if (timeout) {
            timer = setTimeout(abort, timeout);
        }

        let ret = i.promise();
        ret.abort = abort;

        return ret;
    }

    getTransport() {
        if (!this.transport) {
            this.transport = new Transport(this);
        }
        return this.transport;
    }

    canSlice() {
        return !!(Blob.prototype.slice || Blob.prototype.mozSlice || Blob.prototype.webkitSlice);
    }

    slice(blob, start, end) {
        let blobSlice = blob.slice || blob.mozSlice || blob.webkitSlice;

        return blobSlice.call(blob, start, end);
    }

    md5(blob) {
        const i = Deferred();

        if (!window.SparkMD5) {
            i.reject();
            return i.promise();
        }

        let chunkSize = 2 * 1024 * 1024,
            chunks = Math.ceil(blob.size / chunkSize),
            chunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            blobSlice = blob.mozSlice || blob.webkitSlice || blob.slice;

        let fr = new FileReader;

        var loadNext = () => {
            if (!fr) return;
            let start, end;

            start = chunk * chunkSize;
            end = Math.min(start + chunkSize, blob.size);

            fr.onload = () => {
                spark && spark.append(fr.result);
            };

            fr.onloadend = () => {
                if (!fr) return;
                if (fr.readyState == FileReader.DONE) {
                    if (++chunk < chunks) {
                        setTimeout(loadNext, 1);
                    } else {
                        setTimeout(() => {
                            spark && i.resolve(spark.end());
                            loadNext = blob = spark = null;
                        }, 50);
                    }
                } else {
                    i.reject();
                }
                fr.onloadend = fr.onload = null;
            };

            fr.readAsArrayBuffer(blobSlice.call(blob, start, end));
        };

        loadNext();

        let ret = i.promise();
        ret.abort = function () {
            fr && fr.abort();
            spark = null;
            fr = null;
        };

        return ret;
    }
}

module.exports = Html5Runtime;