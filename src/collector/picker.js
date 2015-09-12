import $ from 'jquery';
import Emitter from '../emitter';
import Html5Runtime from '../html5/runtime';
import FlashRuntime from '../flash/runtime';
import File from '../file';

let SWF_URL = '';

class FlashTriggerCollection {
    constructor(core, onFiles) {
        let overlay = $('<label></label>');
        overlay.css({
            position: 'fixed',
            opacity: 0,
            left: -100,
            top: -100,
            width: 50,
            height: 50,
            display: 'block',
            cursor: 'pointer',
            background: 'black',
            overflow: 'hidden',
            zIndex: 99999
        });
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
        this.overlay = overlay.appendTo(document.body);
    }

    hideOverlay() {
        this.overlay.css({
            left: -100,
            top: -100,
            width: 50,
            height: 50
        });
        if (this.current) {
            this.current.emit('rollOut');
            this.current = null;
        }
    }


    add(trigger) {
        const overlay = this.overlay, emitter = new Emitter;
        trigger = trigger.on ? trigger : $(trigger);
        trigger.on('mouseover.flashpicker', (e) => {
            let rect = e.currentTarget.getBoundingClientRect();
            overlay.css({
                left: rect.left,
                top: rect.top,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            });
            emitter.emit('rollOver');
            if (this.current && this.current !== emitter) {
                this.current.emit('rollOut');
            }
            this.current = emitter;
        });

        emitter.destroy = () => {
            if (this.current === emitter) {
                this.hideOverlay();
            }
            emitter.removeAllListeners();
            trigger.off('mouseover.flashpicker');
        };

        return emitter;
    }
}

class Html5TriggerCollection {
    constructor(core, onFiles) {
        const runtime = Html5Runtime.getInstance();

        this._createInput = (label) => {
            let input = $(document.createElement('input'));

            input.attr('type', 'file');
            input.css({
                position:'absolute',
                clip: 'rect(1px 1px 1px 1px)'
            });

            let accept = core.getAccept();
            if (accept && accept.length > 0) {
                accept = accept.map((item) => {
                    return item.mimeTypes || ('.' + item.extensions.join(',.'));
                });

                input.attr('accept', accept.join(','));
            }
            if (core.isMultiple()) {
                input.attr('multiple', 'multiple');
            }

            input.on('change', (e) => {
                onFiles(e.target.files, runtime);
                input.remove();
                this._createInput(label);
            });
            label.html(input);
        };
    }

    add(trigger) {
        const label = $('<label></label>'), emitter = new Emitter;
        label.css({
            position: 'absolute',
            opacity: 0,
            top:0,left:0,
            width: '100%',
            height: '100%',
            display: 'inline-block',
            cursor: 'pointer',
            background: '#fff',
            overflow: 'hidden'
        });
        this._createInput(label);
        trigger = trigger.append ? trigger : $(trigger);
        trigger.append(label);

        emitter.destroy = () => {
            emitter.removeAllListeners();
            label.remove();
        };

        return emitter;
    }
}

export default class PickerCollector {
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

        if (('DataTransfer' in window) && ('FileList' in window)) {
            this.triggerCollection = new Html5TriggerCollection(core, onFiles);
        } else {
            this.triggerCollection = new FlashTriggerCollection(core, onFiles);
        }
    }

    addArea(area) {
        return this.triggerCollection.add(area);
    }
}
