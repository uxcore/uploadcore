import $ from 'jquery';
import Emitter from '../Emitter';
import Runtime from '../Html5/Runtime';
import File from '../File';

export default class PasteCollector {
    static isSupport() {
        return ('DataTransfer' in window) && ('FileList' in window);
    }

    constructor(context) {
        this.context = context;
        this.runtime = Runtime.getInstance();
    }

    addArea(area) {
        area = area.on ? area : $(area);

        const context = this.context,
            runtime = this.runtime,
            emitter = new Emitter;

        const paste = (e) => {
            if (e.isDefaultPrevented()) {
                return;
            }

            const clipboardData = (e.originalEvent || e).clipboardData,
                items = clipboardData.items,
                files = clipboardData.files;

            try {
                if ((!items && !files) || clipboardData.getData('text/html')) {
                    return;
                }
            } catch (ex) {}

            let prevent, i, l, file, item;

            if (files && files.length) {
                // safari has files
                prevent = files.length > 0;
                for (i = 0, l = files.length; i < l && !context.isLimit(); i++) {
                    file = new File(runtime, files[i]);

                    prevent = 1;

                    if (context.add(file) && !context.isMultiple()) {
                        break;
                    }
                }
            } else if (items && items.length) {
                // chrome has items
                let filename = clipboardData.getData('text/plain');
                for (i = 0, l = items.length; i < l && !context.isLimit(); i++) {
                    item = items[i];

                    if (item.kind !== 'file' || !(file = item.getAsFile())) {
                        continue;
                    }

                    file = new File(runtime, file, filename);
                    filename = null;

                    prevent = 1;

                    if (context.add(file) && !context.isMultiple()) {
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

        area.on('paste', paste);

        emitter.destroy = () => {
            emitter.removeAllListeners();
            area.off('paste', paste);
        };

        return emitter;
    }
}
