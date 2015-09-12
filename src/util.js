export function formatSize(size) {
    size = parseFloat(size);
    const prefixesSI = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        base = 1024;
    let index = size ? Math.floor(Math.log(size) / Math.log(base)) : 0;
    index = Math.min(index, prefixesSI.length - 1);
    let powedPrecision = Math.pow(10, index < 2 ? 0 : (index > 2 ? 2 : 1));
    size = size / Math.pow(base, index);
    size = Math.round(size * powedPrecision) / powedPrecision;
    return size + prefixesSI[index] + 'B';
}

export function parseSize(size) {
    if (typeof size !== 'string') {
        return size;
    }

    const units = {
        t: 1099511627776,
        g: 1073741824,
        m: 1048576,
        k: 1024
    };

    size = /^([0-9\.]+)([tgmk]?)b?$/i.exec(size);
    const u = size[2];
    size = +size[1];

    if (units.hasOwnProperty(u)) {
        size *= units[u];
    }
    return size;
}

const ACCEPTs = {
    images: {
        title: 'Images',
        extensions: ['jpg','jpeg','gif','png','bmp','svg','tiff','tif','ico','jpe','svgz','pct','psp','ai','psd','raw','webp']
    },

    audios: {
        title: 'Audios',
        extensions: ['aac','aif','flac','iff','m4a','m4b','mid','midi','mp3','mpa','mpc','oga','ogg','ra','ram','snd','wav','wma']
    },

    videos: {
        title: 'Videos',
        extensions: ['avi','divx','flv','m4v','mkv','mov','mp4','mpeg','mpg','ogm','ogv','ogx','rm','rmvb','smil','webm','wmv','xvid']
    }
};

function normalizeExtensions(extensions) {
    if (typeof extensions !== 'string') {
        return '';
    }

    return extensions.toLowerCase().split(/ *[ ,;|+] */).map((ext) => {
        let m = /^\*?\.?(\w+)$/.exec(ext);
        return m ? m[1] : null;
    }).filter(ext => ext !== null);
}

export function normalizeAccept(accepts) {
    if (!accepts) return null;

    if (!Array.isArray(accepts)) {
        accepts = [accepts];
    }

    return accepts.map((accept) => {
        if (typeof accept === 'string' && (accept = accept.toLowerCase()) && ACCEPTs.hasOwnProperty(accept)) {
            return ACCEPTs[accept];
        } else {
            let extensions = normalizeExtensions(accept.extensions || accept);

            return extensions.length ? {
                title: accept.title || '',
                extensions: extensions,
                mimeTypes: accept.mimeTypes || ''
            } : null;
        }
    }).filter(accept => accept !== null);
}