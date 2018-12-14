const { Core, Events, Status } = window.UploadCore;

const core = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    params: {},
    headers: null,
    withCredentials: false,
    timeout: 0,
    chunkEnable: true,
    chunkSize: '2m',
    chunkProcessThreads: 3,
    processThreads: 3,
    autoPending: true,
    queueCapcity: 0,
    multiple: true,
    accept: null,
    sizeLimit: '2g',
    preventDuplicate: false
});

window.xcore = core;

let token = null;
core.on(Events.FILE_UPLOAD_PREPARING, (request) => {
    if (token) {
        request.setParam('token', token);
    } else {
        return fetch('http://test.yanbingbing.com/token.php').then((res) => {
            return res.json();
        }).then((json) => {
            token = json.token;
            request.setParam('token', token);
        });
    }
}).on(Events.FILE_UPLOAD_PREPARING, (request) => {
    if (request.isChunkEnable()) {
        const size = request.file.size;
        const ext = request.file.ext;
        const chunkTotal = Math.ceil(size / request.getChunkSize());
        return fetch(`http://test.yanbingbing.com/transaction.php?size=${size}&ext=${ext}&chunkTotal=${chunkTotal}`).then((res) => {
            return res.json();
        }).then((json) => {
            request.setParam('transId', json.data.transId);
        });
    }
}).on(Events.CHUNK_UPLOAD_PREPARING, (request) => {
    if (request.isMultiChunk()) {
        request.setUrl('http://test.yanbingbing.com/chunk.php');
        request.setParam('sequence', request.getIndex());
    }
}).on(Events.FILE_UPLOAD_COMPLETING, (response) => {
    if (response.isFromMultiChunkResponse()) {
        const transId = response.getFileRequest().getParam('transId');
        return fetch(`http://test.yanbingbing.com/transaction.php?transId=${transId}`).then(res => {
            return res.json();
        }).then(json => {
            response.setResponse(json);
        });
    }
}).on(Events.FILE_UPLOAD_COMPLETING, response => {
    let json = response.getJson();
    if (!json || json.code !== 0) {
        return new Error('error');
    }
});

// 队列添加了一个文件
core.on(Events.QUEUE_FILE_ADDED, (file) => {
    console.info('queuefileadded', file);
    file.session().progress((e) => {
        console.info('progress', e.percentage);
    }).fail((error) => {
        console.info(error)
    }).done((response) => {
        console.info(response.getJson())
    });
});

core.on(Events.CHUNK_UPLOAD_PREPARING, (request) => {
    console.info('chunkuploadpreparing', request.getIndex());
}).on(Events.CHUNK_UPLOAD_COMPLETING, (response) => {
    console.info('chunkuploadcompleting', response.getChunkRequest().getIndex());
});

/*
const dnd = core.getDndCollector();

dnd.addArea(document.documentElement);*/

const picker = core.getPickerCollector();

picker.addArea(document.getElementById('button'));


const paster = core.getPasteCollector();

paster.addArea(document.getElementById('pastearea'));
