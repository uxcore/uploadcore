const Emitter = require('../emitter');
const Html5Runtime = require('../html5/runtime');
const File = require('../file');
const { extend } = require('../util');

const createElement = (() => {
    if (typeof document !== 'object') {
        return;
    }

    var div = document.createElement('div');
    return function (html) {
        div.innerHTML = html;
        html = div.firstChild;
        div.removeChild(html);
        return html;
    };
})();

class Html5TriggerCollection {
    constructor(core, onFiles) {
        const runtime = Html5Runtime.getInstance();
        this.core = core;
        this.onFiles = (files) => {
            onFiles(files, runtime);
        };
        this.onChange = (e) => {
            this.onFiles(e.target.files);
            this.destroyInput();
            this.createInput();
        };
        this.createInput();
    }

    destroyInput() {
        if (!this.input) return;
        this.input.removeEventListener('change', this.onChange, false);
        document.body.removeChild(this.input);
        this.input = null;
    }

    createInput() {
        const input = createElement('<input type="file" style="position:absolute;clip:rect(1px 1px 1px 1px);" />');

        let accept = this.core.getAccept();
        if (accept && accept.length > 0) {
            accept = accept.map((item) => {
                return item.mimeTypes || ('.' + item.extensions.join(',.'));
            });

            input.setAttribute('accept', accept.join(','));
        }
        if (this.core.isMultiple()) {
            input.setAttribute('multiple', 'multiple');
        }

        input.addEventListener('change', this.onChange, false);
        document.body.appendChild(input);
        this.input = input;
    }

    add(trigger) {
        const fn = () => {
            this.input.click();
        };
        trigger.addEventListener('click', fn);

        return {
            destroy() {
                trigger.removeEventListener('click', fn);
            },
        };
    }
}

class PickerCollector {
    static setSWF(url) {
        // empty
    }
    constructor(core) {
        const onFiles = (files, runtime) => {
            for (let i = 0, l = files.length; i < l; i++) {
                if (core.add(new File(runtime, files[i])) < 0) {
                    break;
                }
            }
        };

        this.triggerCollection = new Html5TriggerCollection(core, onFiles);
    }

    addArea(area) {
        return this.triggerCollection.add(area);
    }
}

module.exports = PickerCollector;