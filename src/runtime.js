import FileUploading from './fileuploading';
import Emitter from './emitter';
import {Deferred} from 'jquery';

export default class Runtime extends Emitter {
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
            this.uploading = new FileUploading(this);
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
