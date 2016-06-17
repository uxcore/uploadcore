const Emitter = require('../emitter');
const Html5Runtime = require('../html5/runtime');
const FlashRuntime = require('../flash/runtime');
const File = require('../file');
const {extend} = require('../util');


let SWF_URL = '';

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

class FlashTriggerCollection {
    constructor(core, onFiles) {
        const overlay = createElement('<label style="position:fixed;left:-100px;top:-100px;width:50px;height:50px;display:block;cursor:pointer;overflow:hidden;z-index:99999;opacity:0;filter:alpha(opacity=0)"></label>');

        const runtime = new FlashRuntime(overlay, SWF_URL, () => {
            return {
                accept: core.getAccept(),
                multiple: core.isMultiple()
            };
        });

        runtime.on('select', (e) => {
            onFiles(e.files, runtime);
            this.current && this.current.emit('files', e.files, runtime);
        });

        runtime.on('rollOut', () => this.hideOverlay());

        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    hideOverlay() {
        extend(this.overlay.style, {
            left: '-100px',
            top: '-100px',
            width: '50px',
            height: '50px'
        });
        if (this.current) {
            this.current.emit('rollOut');
            this.current = null;
        }
    }


    add(trigger) {
        const overlay = this.overlay, emitter = new Emitter;
        const mouseover = () => {
            const rect = trigger.getBoundingClientRect();
            extend(overlay.style, {
                left: rect.left + 'px',
                top: rect.top + 'px',
                width: (rect.right - rect.left) + 'px',
                height: (rect.bottom - rect.top) + 'px'
            });
            emitter.emit('rollOver');
            if (this.current && this.current !== emitter) {
                this.current.emit('rollOut');
            }
            this.current = emitter;
        };

        if (trigger.addEventListener) {
            trigger.addEventListener('mouseover', mouseover, false);
        } else if (trigger.attachEvent) {
            trigger.attachEvent("onmouseover", mouseover);
        }

        emitter.destroy = () => {
            if (this.current === emitter) {
                this.hideOverlay();
            }
            emitter.removeAllListeners();
            if (trigger.removeEventListener) {
                trigger.removeEventListener('mouseover', mouseover, false);
            } else if (trigger.detachEvent) {
                trigger.detachEvent("onmouseover", mouseover);
            }
        };

        return emitter;
    }
}

class Html5Trigger extends Emitter {
    constructor(trigger, core, onFiles) {
        super();

        this.trigger = trigger;
        this.core = core;
        this.label = createElement('<label style="position:absolute;top:0;left:0;width:100%;height:100%;display:inline-block;cursor:pointer;background:#fff;overflow:hidden;opacity:0"></label>');

        this.onChange = (e) => {
            onFiles(e.target.files);
            this.destroyInput();
            this.createInput();
        };
        trigger.appendChild(this.label);
        this.createInput();
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

        this.label.appendChild(input);
        this.input = input;
    }

    destroyInput() {
        if (!this.input) return;
        this.input.removeEventListener('change', this.onChange, false);
        this.label.removeChild(this.input);
        this.input = null;
    }

    destroy() {
        this.destroyInput();
        this.removeAllListeners();
        this.trigger.removeChild(this.label);
    }
}

class Html5TriggerCollection {
    constructor(core, onFiles) {
        const runtime = Html5Runtime.getInstance();
        this.core = core;
        this.onFiles = (files) => {
            onFiles(files, runtime);
        };
    }

    add(trigger) {
        return new Html5Trigger(trigger, this.core, this.onFiles);
    }
}

class PickerCollector {
    static setSWF(url) {
        SWF_URL = url;
    }
    constructor(core) {

        const onFiles = (files, runtime) => {
            for (let i = 0, l = files.length; i < l; i++) {
                if (core.add(new File(runtime, files[i])) < 0) {
                    break;
                }
            }
        };

        if (window.File && window.FileList && window.FileReader) {
            this.triggerCollection = new Html5TriggerCollection(core, onFiles);
        } else {
            this.triggerCollection = new FlashTriggerCollection(core, onFiles);
        }
    }

    addArea(area) {
        return this.triggerCollection.add(area);
    }
}

module.exports = PickerCollector;