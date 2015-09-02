import $ from 'jquery';
import Emitter from '../emitter';
import Runtime from '../html5/runtime';
import File from '../file';

function createReader(collector) {
    function reader(dataTransfer, responders) {
        var items = dataTransfer.items,
            files = dataTransfer.files,
            item;

        for (let i = 0, l = files.length; i < l; i++) {
            item = items && items[i];

            let entry = item && item.webkitGetAsEntry && item.webkitGetAsEntry();

            if (entry && entry.isDirectory) {
                readEntry(entry, responders);
            } else {
                collector(files[i], responders);
            }
        }
    }
    function readEntry(entry, responders) {
        if (entry.isFile) {
            entry.file((file) => collector(file, responders));
        } else if (entry.isDirectory) {
            entry.createReader().readEntries((entries) => {
                for (let i = 0, l = entries.length; i < l; i++) {
                    readEntry(entries[i], responders);
                }
            });
        }
    }
    return reader;
}

class Area extends Emitter {
    constructor(area) {
        super();

        this.areaElement = area;
    }

    contains(target) {
        return this.areaElement.contains(target);
    }

    start(e, allowed) {
        this.emit('start', e, allowed);
    }

    response(e, allowed) {
        allowed = allowed && this.contains(e.target);
        this.emit('response', e, allowed);
        return allowed;
    }

    end(e) {
        this.emit('end', e);
    }
}

const Collectors = [];

function prepare() {
    const $doc = $(document),
        runtime = Runtime.getInstance();

    let started = 0, enter = 0, endTimer;
    const dataTransferReader = createReader((file, responders) => {
        if (!responders || responders.length < 1) {
            return;
        }
        file = new File(runtime, file);
        responders.some((responder) => responder.recieve(file));
    });

    const start = (e) => {
        started = 1;
        Collectors.forEach((responder) => responder.start(e));
    };

    const move = (e) => {
        var allowed = Collectors.filter((responder) => responder.response(e));

        var dataTransfer = (e.originalEvent || e).dataTransfer;

        if (dataTransfer) {
            dataTransfer.dropEffect = allowed.length ? 'copy' : 'none';
        }
        e.preventDefault();
    };

    const end = (e) => {
        started = 0;
        enter = 0;
        Collectors.forEach((responder) => responder.end(e));
    };

    const drag = (e) => {
        clearTimeout(endTimer);
        let isLeave = e.type === 'dragleave';
        if (!isLeave && !started) {
            start(e);
        }
        move(e);
        if (isLeave) {
            endTimer = setTimeout(() => end(e), 100);
        }
    };
    const drop = (e) => {
        e.preventDefault();

        clearTimeout(endTimer);
        end(e);

        const responders = Collectors.filter((responder) => responder.contains(e.target));

        if (responders.length < 1) {
            return;
        }

        let dataTransfer = (e.originalEvent || e).dataTransfer;

        try {
            if (dataTransfer.getData('text/html')) {
                return;
            }
        } catch (ex) {}

        dataTransferReader(dataTransfer, responders);
    };

    $doc.on('dragenter dragover dragleave', drag);
    $doc.on('drop', drop);
}

export default class DndCollector {
    static isSupport() {
        return ('DataTransfer' in window) && ('FileList' in window);
    }

    constructor(context) {
        if (Collectors.length < 1) {
            prepare();
        }
        Collectors.push(this);

        this.context = context;
        this.areas = [];
    }

    addArea(area) {
        area = new Area(area);
        this.areas.push(area);
        area.destroy = () => {
            area.removeAllListeners();
            let i = this.areas.indexOf(area);
            if (i > -1) {
                this.areas.splice(i, 1);
            }
        };

        return area;
    }

    contains(target) {
        return this.areas.some((area) => area.contains(target));
    }

    start(e) {
        const allowed = !this.context.isLimit();
        this.areas.forEach((area) => area.start(e, allowed));
    }

    response(e) {
        const allowed = !this.context.isLimit(),
            res = this.areas.map((area) => area.response(e, allowed));
        return allowed && res.some((r) => !!r);
    }

    recieve(file) {
        return this.context.add(file);
    }

    end(e) {
        this.areas.forEach((area) => area.end(e));
    }
}
