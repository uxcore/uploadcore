import $ from 'jquery';
import {Uploader, Events, Status} from 'uxuploader';

/*
 1. 点击触发上传、拖动上传、粘贴上传多个文件到服务器；
 2. 每个文件上传之前需要获得token，token有失效期；
 3. 上传完成返回的数据需要转换，根据code判断是否成功与否。
 */

Uploader.setSWF('/src/flash/bin-debug/FlashPicker.swf');

const context = new Uploader({
    request: {
        name: 'file',
        url: 'http://test.yanbingbing.com/upload.php',
        params: {},
        headers: null,
        withCredentials: false,
        timeout: 0,
        chunkEnable: false
    },
    processThreads: 3,
    autoPending: true,
    queueCapcity: 0,
    multiple: true,
    accept: [
        {
            title: 'Images',
            extensions: 'jpg,jpeg,png,gif,bmp',
            mimeTypes: 'image/*'
        }
    ],
    sizeLimit: '1m',
    preventDuplicate: false
});

// 上传完成
context.on(Events.FILE_UPLOAD_COMPLETING, response => {
    let json = response.getJson();
    if (!json || json.code !== 0) {
        return new Error('error');
    }
});

// 队列错误
context.on(Events.QUEUE_ERROR, (error) => console.info('queueerror', error));

// 队列过滤了一个文件
context.on(Events.QUEUE_FILE_FILTERED, (file, error) => console.info('queuefilefiltered', file, error));

// 队列添加了一个文件
context.on(Events.QUEUE_FILE_ADDED, (file) => {
    console.info('queuefileadded', file);
    file.session().progress((e) => {
        console.info('progress', e);
    }).fail((error) => {
        console.info(error)
    }).done((response) => {
        console.info(response.getJson())
    });
});

context.on(Events.QUEUE_UPLOAD_START, () => {
   console.info('queueuploadstart');
});

context.on(Events.QUEUE_UPLOAD_END, () => {
    console.info('queueuploadend');
});

context.on(Events.QUEUE_STAT_CHANGE, (stat) => {
    console.info('statchange', stat.stat());
});

context.on(Events.FILE_UPLOAD_START, (file) => {
    console.info('fileuploadstart', file);
}).on(Events.FILE_UPLOAD_PREPARING, (request) => {
    console.info('fileuploadpreparing', request);
}).on(Events.FILE_UPLOAD_PREPARED, (file) => {
    console.info('fileuploadprepared', file);
}).on(Events.CHUNK_UPLOAD_PREPARING, (request) => {
    console.info('chunkuploadpreparing', request);
}).on(Events.CHUNK_UPLOAD_COMPLETING, (response) => {
    console.info('chunkuploadcompleting', response);
}).on(Events.FILE_UPLOAD_PROGRESS, (file, progress) => {
    console.info('fileuploadprogress', file, progress);
}).on(Events.FILE_UPLOAD_END, (file) => {
    console.info('fileuploadend', file);
}).on(Events.FILE_UPLOAD_COMPLETING, (response) => {
    console.info('fileuploadcompleting', response);
}).on(Events.FILE_UPLOAD_SUCCESS, (file, response) => {
    console.info('fileuploadsuccess', file, response);
}).on(Events.FILE_UPLOAD_ERROR, (file, error) => {
    console.info('fileuploaderror', file, error);
}).on(Events.FILE_UPLOAD_COMPLETED, (file, status) => {
    console.info('fileuploadcompleted', file, status);
}).on(Events.FILE_CANCEL, (file) => {
    console.info('filecancel', file);
}).on(Events.FILE_STATUS_CHANGE, (file, status) => {
    console.info('filestatuschange', file, status, file.getStatusName());
});


const dnd = context.getDndCollector();

dnd.addArea(document.documentElement);

const picker = context.getPickerCollector();

picker.addArea(document.getElementById('button'));

const paster = context.getPasteCollector();

paster.addArea(document.getElementById('pastearea'));
