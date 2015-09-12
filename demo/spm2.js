define(function (require) {
    "use strict";

    var Uploader = require('uxuploader'),
        Events = Uploader.Events, Status = Uploader.Status;

    var context = new Uploader({
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
        accept: 'images',
        sizeLimit: '1g',
        preventDuplicate: false
    });

    // 上传完成
    context.on(Events.FILE_UPLOAD_COMPLETING, function (response) {
        var json = response.getJson();
        if (!json || json.code !== 0) {
            return new Error('error');
        }
    });

    // 队列错误
    context.on(Events.QUEUE_ERROR, function (error) {
        console.info('queueerror', error);
    });

    // 队列过滤了一个文件
    context.on(Events.QUEUE_FILE_FILTERED, function (file, error) {
        console.info('queuefilefiltered', file, error);
    });

    // 队列添加了一个文件
    context.on(Events.QUEUE_FILE_ADDED, function (file) {
        console.info('queuefileadded', file);
        file.session().progress(function (e) {
            console.info('progress', e);
        }).fail(function (error) {
            console.info(error)
        }).done(function (response) {
            console.info(response.getJson())
        });
    });

    context.on(Events.QUEUE_UPLOAD_START, function () {
        console.info('queueuploadstart');
    });

    context.on(Events.QUEUE_UPLOAD_END, function () {
        console.info('queueuploadend');
    });

    context.on(Events.QUEUE_STAT_CHANGE, function (stat) {
        console.info('statchange', stat.stat());
    });

    context.on(Events.FILE_UPLOAD_START, function (file) {
        console.info('fileuploadstart', file);
    }).on(Events.FILE_UPLOAD_PREPARING, function (request) {
        console.info('fileuploadpreparing', request);
    }).on(Events.FILE_UPLOAD_PREPARED, function (file) {
        console.info('fileuploadprepared', file);
    }).on(Events.CHUNK_UPLOAD_PREPARING, function (request) {
        console.info('chunkuploadpreparing', request);
    }).on(Events.CHUNK_UPLOAD_COMPLETING, function (response) {
        console.info('chunkuploadcompleting', response);
    }).on(Events.FILE_UPLOAD_PROGRESS, function (file, progress) {
        console.info('fileuploadprogress', file, progress);
    }).on(Events.FILE_UPLOAD_END, function (file) {
        console.info('fileuploadend', file);
    }).on(Events.FILE_UPLOAD_COMPLETING, function (response) {
        console.info('fileuploadcompleting', response);
    }).on(Events.FILE_UPLOAD_SUCCESS, function (file, response) {
        console.info('fileuploadsuccess', file, response);
    }).on(Events.FILE_UPLOAD_ERROR, function (file, error) {
        console.info('fileuploaderror', file, error);
    }).on(Events.FILE_UPLOAD_COMPLETED, function (file, status) {
        console.info('fileuploadcompleted', file, status);
    }).on(Events.FILE_CANCEL, function (file) {
        console.info('filecancel', file);
    }).on(Events.FILE_STATUS_CHANGE, function (file, status) {
        console.info('filestatuschange', file, status, file.getStatusName());
    });


    var dnd = context.getDndCollector();

    dnd.addArea(document.documentElement);

    var picker = context.getPickerCollector();

    picker.addArea(document.getElementById('button'));

    var paster = context.getPasteCollector();

    paster.addArea(document.getElementById('pastearea'));

});
