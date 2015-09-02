import Queue from './queue';
import FileRequest from './filerequest';
import Aspector from './aspector';
import DndCollector from './collector/dnd';
import PasteCollector from './collector/paste';
import PickerCollector from './collector/picker';

export default class Context {
    constructor(options) {
        this.queue = new Queue(this, options);

        this.requestOptions = options.request || {};

        this.aspector = new Aspector;
    }

    aspect(aspect, hook) {
        aspect = this.aspector.getAspect(aspect);
        if (hook) {
            aspect.add(hook);
        }
        return aspect;
    }

    createFileRequest(file) {
        return new FileRequest(file, this.requestOptions);
    }

    getQueue() {
        return this.queue;
    }

    getPickerCollector(swf) {
        if (!this.picker) {
            this.picker = new PickerCollector(this, swf);
        }
        return this.picker;
    }

    getDndCollector() {
        if (!this.dnd) {
            this.dnd = new DndCollector(this);
        }
        return this.dnd;
    }

    getPasteCollector() {
        if (!this.paster) {
            this.paster = new PasteCollector(this);
        }
        return this.paster;
    }
}
