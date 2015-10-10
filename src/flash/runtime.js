const Runtime = require('../runtime');
const Transport = require('./transport');

function getFlashVersion() {
    let version;

    try {
        version = navigator.plugins['Shockwave Flash'];
        version = version.description;
    } catch (e1) {
        try {
            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
        } catch (e2) {
            version = '0.0';
        }
    }
    version = version.match(/\d+/g);
    return parseFloat(version[0] + '.' + version[1]);
}

function callFlash(movie, functionName, argumentArray) {
    try {
        movie.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray || [], 0) + '</invoke>');
    } catch (ex) {
        throw "Call to " + functionName + " failed";
    }
}

function createFlash(swf, callInterface) {
    if (getFlashVersion() < 11.4) {
        throw 'flash player is not available';
    }
    const div = document.createElement('div');
    let url = swf + (swf.indexOf('?') > 0 ? '&' : '?') + 'callInterface=' + encodeURIComponent(callInterface);
    let attrs = [
        'id="' + callInterface + '-Picker"',
        'type="application/x-shockwave-flash"',
        'data="' + url + '"',
        'width="100%" height="100%"',
        'style="position:absolute;left:0;top:0;display:block;z-index:1;outline:0"'
    ];
    if (window.ActiveXObject) {
        attrs.push('classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"');
    }
    div.innerHTML = '<object ' + attrs.join(' ') + '>' +
        '<param name="movie" value="' + url + '" />' +
        '<param name="wmode" value="transparent" />' +
        '<param name="allowscriptaccess" value="always" />' +
    '</object>';

    return div.firstChild;
}

let _guid = +new Date;
function guid(prefix) {
    let ret = prefix + (_guid++).toString(16);
    if (ret in window) {
        return guid(prefix);
    }
    return ret;
}

class FlashRuntime extends Runtime {
    constructor(trigger, swf, options) {
        super();

        const callInterface = guid('FlashRuntime');

        this.callInterface = callInterface;
        window[callInterface] = this;

        this.options = options;

        const _this = this;
        function display() {
            let w = trigger.offsetWidth, h = trigger.offsetHeight, flash;
            if (!w || !h || !(flash = createFlash(swf, callInterface))) {
                setTimeout(display, 1000);
                return;
            }

            trigger.appendChild(_this.flash = flash);
        }

        display();
    }
    getOptions() {
        let options = this.options;
        if (typeof options === 'function') {
            options = options();
        }
        return options;
    }
    getTransport(name, blob, options) {
        return new Transport(this, name, blob, options);
    }
    send(name, blob, url, params) {
        callFlash(this.flash, 'exec', ['send', name, blob.id, url, params]);
    }
    abort(blob) {
        try {
            callFlash(this.flash, 'exec', ['abort', blob.id]);
        } catch (e) {}
    }
    cancel(blob) {
        callFlash(this.flash, 'exec', ['cancel', blob.id]);
    }
    ping() {
        callFlash(this.flash, 'exec', ['pang']);
    }
    destroy() {
        delete window[this.callInterface];
    }
}

module.exports = FlashRuntime;