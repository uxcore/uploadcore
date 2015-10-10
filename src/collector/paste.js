const Emitter = require('../emitter');
const Runtime = require('../html5/runtime');
const File = require('../file');

class PasteCollector {
    constructor(core) {
        this.core = core;
        this.runtime = Runtime.getInstance();
    }

    addArea(area) {
        const core = this.core,
            runtime = this.runtime,
            emitter = new Emitter;

        const paste = (e) => {

            const clipboardData = e.clipboardData || window.clipboardData,
                items = clipboardData.items,
                files = clipboardData.files;

            if (!files && !items) {
                return;
            }

            let prevent, i, l, file, item, addRet;

            if (files && files.length) {
                // safari has files
                prevent = files.length > 0;
                for (i = 0, l = files.length; i < l; i++) {
                    file = new File(runtime, files[i]);

                    prevent = 1;

                    addRet = core.add(file);
                    if (addRet < 0 || (addRet > 0 && !core.isMultiple())) {
                        break;
                    }
                }
            } else if (items && items.length) {
                // chrome has items
                let filename = clipboardData.getData('text/plain');
                for (i = 0, l = items.length; i < l && !core.isLimit(); i++) {
                    item = items[i];

                    if (item.kind !== 'file' || !(file = item.getAsFile())) {
                        continue;
                    }

                    file = new File(runtime, file, filename);
                    filename = null;

                    prevent = 1;

                    addRet = core.add(file);
                    if (addRet < 0 || (addRet > 0 && !core.isMultiple())) {
                        break;
                    }
                }
            }

            if (prevent) {
                e.preventDefault();
                e.stopPropagation();
                emitter.emit('paste', clipboardData);
            }
        };

        if (('DataTransfer' in window) && ('FileList' in window) && area.addEventListener) {
            area.addEventListener('paste', paste, false);
        }

        emitter.destroy = () => {
            emitter.removeAllListeners();
            if (area.removeEventListener) {
                area.removeEventListener('paste', paste, false);
            }
        };

        return emitter;
    }
}

module.exports = PasteCollector;