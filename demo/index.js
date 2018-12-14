const { Core, Events, Status } = require('uploadcore');

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

window.core = core;


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

// 队列错误
core.on(Events.QUEUE_ERROR, (error) => console.info('queueerror', error));

// 队列过滤了一个文件
core.on(Events.QUEUE_FILE_FILTERED, (file, error) => console.info('queuefilefiltered', file, error));

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

core.on(Events.QUEUE_UPLOAD_START, () => {
   // console.info('queueuploadstart');
});

core.on(Events.QUEUE_UPLOAD_END, () => {
    // console.info('queueuploadend');
});

core.on(Events.QUEUE_STAT_CHANGE, (stat) => {
    // console.info('statchange', stat.stat());
});

core.on(Events.FILE_UPLOAD_START, (file) => {
    // console.info('fileuploadstart');
}).on(Events.FILE_UPLOAD_PREPARING, (request) => {
    // console.info('fileuploadpreparing');
}).on(Events.FILE_UPLOAD_PREPARED, (file) => {
    // console.info('fileuploadprepared');
}).on(Events.CHUNK_UPLOAD_PREPARING, (request) => {
    console.info('chunkuploadpreparing', request.getIndex());
}).on(Events.CHUNK_UPLOAD_COMPLETING, (response) => {
    console.info('chunkuploadcompleting', response.getChunkRequest().getIndex());
}).on(Events.FILE_UPLOAD_PROGRESS, (file, progress) => {
    // console.info('fileuploadprogress', progress);
}).on(Events.FILE_UPLOAD_END, (file) => {
    // console.info('fileuploadend');
}).on(Events.FILE_UPLOAD_COMPLETING, (response) => {
    // console.info('fileuploadcompleting');
}).on(Events.FILE_UPLOAD_SUCCESS, (file, response) => {
    // console.info('fileuploadsuccess');
}).on(Events.FILE_UPLOAD_ERROR, (file, error) => {
    // console.info('fileuploaderror', error);
}).on(Events.FILE_UPLOAD_COMPLETED, (file, status) => {
    // console.info('fileuploadcompleted', status);
}).on(Events.FILE_CANCEL, (file) => {
    // console.info('filecancel');
}).on(Events.FILE_STATUS_CHANGE, (file, status) => {
    // console.info('filestatuschange', status, file.getStatusName());
});

/*
const dnd = core.getDndCollector();

dnd.addArea(document.documentElement);*/

const picker = core.getPickerCollector();

picker.addArea(document.getElementById('button'));


const paster = core.getPasteCollector();

paster.addArea(document.getElementById('pastearea'));
