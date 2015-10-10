const Emitter = require('../emitter');
const Runtime = require('../html5/runtime');
const File = require('../file');

const MAX_NUM_ONCE = 100;

function createReader(collector) {
    return (dataTransfer, responders) => {
        const items = dataTransfer.items,
            files = dataTransfer.files;
        let item, times = MAX_NUM_ONCE;
        let _break = false;

        function collect(file) {
            if (--times < 0 || !collector(file, responders)) {
                _break = true;
                return false;
            }
            return true;
        }

        function readEntry(entry) {
            if (_break) return;
            if (entry.isFile) {
                entry.file((file) => {
                    if (!_break) {
                        collect(file);
                    }
                });
            } else if (entry.isDirectory) {
                entry.createReader().readEntries((entries) => {
                    if (_break) return;
                    for (let i = 0, l = entries.length; i < l; i++) {
                        if (_break) break;
                        readEntry(entries[i]);
                    }
                });
            }
        }

        for (let i = 0, l = files.length; i < l; i++) {
            if (_break) break;
            item = items && items[i];

            let entry = item && item.webkitGetAsEntry && item.webkitGetAsEntry();

            if (entry && entry.isDirectory) {
                readEntry(entry);
            } else {
                if (!collect(files[i])) {
                    break;
                }
            }
        }
    }
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
    if (!('DataTransfer' in window) || !('FileList' in window) || !document.addEventListener) {
        return;
    }

    const runtime = Runtime.getInstance();

    let started = 0, enter = 0, endTimer;
    const dataTransferReader = createReader((file, responders) => {
        if (!responders || responders.length < 1) {
            return false;
        }
        file = new File(runtime, file);
        let total = responders.length;
        return responders.some((responder) => {
            const ret = responder.recieve(file);
            if (ret > 0) {
                return true;
            }
            if (ret < 0) {
                total -= 1;
            }
            return false;
        }) || total > 0;
    });

    const start = (e) => {
        started = 1;
        Collectors.forEach((responder) => responder.start(e));
    };

    const move = (e) => {
        const has = Collectors.filter(responder => responder.response(e)).length > 0;

        const dataTransfer = e.dataTransfer;

        if (dataTransfer) {
            dataTransfer.dropEffect = has ? 'copy' : 'none';
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

        let dataTransfer = e.dataTransfer;

        try {
            if (dataTransfer.getData('text/html')) {
                return;
            }
        } catch (ex) {}

        dataTransferReader(dataTransfer, responders);
    };

    document.addEventListener('dragenter', drag, false);
    document.addEventListener('dragover', drag, false);
    document.addEventListener('dragleave', drag, false);
    document.addEventListener('drop', drop, false);
}

class DndCollector {

    constructor(core) {
        if (Collectors.length < 1) {
            prepare();
        }
        Collectors.push(this);

        this.core = core;
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
        this.areas.forEach((area) => area.start(e));
    }

    response(e) {
        return this.areas.map((area) => area.response(e)).some(r => r !== false);
    }

    recieve(file) {
        const ret = this.core.add(file);
        if (ret > 0 && !this.core.isMultiple()) {
            return -1;
        } else {
            return ret;
        }
    }

    end(e) {
        this.areas.forEach((area) => area.end(e));
    }
}

module.exports = DndCollector;