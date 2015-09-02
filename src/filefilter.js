import Set from './set';
import {FilterError} from './errors';

export default class FileFilter {
    constructor() {
        this.filters = new Set;
    }

    add(filter) {
        this.filters.add(filter);
        return this;
    }

    remove(filter) {
        this.filters.remove(filter);
        return this;
    }

    filter(file) {
        this.error = null;
        return this.filters.toArray().every((filter) => {
            let ret;
            try {
                ret = filter(file);
            } catch (e) {
                ret = e;
            }
            if (typeof ret === 'string') {
                this.error = new FilterError(file, ret);
                return false;
            } else if (ret instanceof Error) {
                this.error = ret instanceof FilterError ? ret : new FilterError(file, ret.toString());
                return false;
            }
            return true;
        });
    }

    getError() {
        return this.error;
    }
}
