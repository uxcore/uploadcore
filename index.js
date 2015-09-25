var Core = UploadCore.UploadCore,
    Events = UploadCore.Events,
    Status = UploadCore.Status;

function output(target, content, clear) {
    var $target = jQuery(target).show();
    if (clear) {
        $target.empty();
    }
    $target.append('<p>'+content+'</p>');
    $target[0].scrollTop = $target[0].scrollHeight + 1000;
}

var up;

// sample 1

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});


up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console1', 'select file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console1', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console1', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console1', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console1', 'file "'+ file.name +'" error:' + error.toString());
        })
});


// 事件监听
up.on(Events.FILE_UPLOAD_COMPLETED, function (file) {
    if (file.getStatus() === Status.SUCCESS) {
        alert('上传成功');
        console.info(file.response.getJson());
    } else {
        alert('上传失败');
    }
});

// 添加触发区域
var picker = up.getPickerCollector();
picker.addArea(document.getElementById('clickarea'));






// sample 2: 粘贴上传

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});

up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console2', 'paste file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console2', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console2', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console2', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console2', 'file "'+ file.name +'" error:' + error.toString());
        })
});

up.getPasteCollector().addArea(document.getElementById('pastearea'));








// sample 3: 多触发区域


up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});


up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console3', 'select file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console3', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console3', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console3', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console3', 'file "'+ file.name +'" error:' + error.toString());
        })
});



// 添加触发区域
picker = up.getPickerCollector();
picker.addArea(document.getElementById('clickarea1'));
picker.addArea(document.getElementById('clickarea2'));






// sample 4: 拖拽上传

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});


up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console4', 'add file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console4', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console4', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console4', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console4', 'file "'+ file.name +'" error:' + error.toString());
        })
});

var $area = jQuery('#droparea');
var dndArea = up.getDndCollector().addArea($area[0]);
dndArea.on('start', function () {
    $area.addClass('blink');
    output('#console4', 'drag start')
}).on('response', function (e) {
    if ($area[0].contains(e.target)) {
        output('#console4', 'drag response: enter area');
        $area.addClass('enter');
    } else {
        $area.removeClass('enter');
        output('#console4', 'drag response: leave area');
    }
}).on('end', function () {
    $area.removeClass('enter blink');
    output('#console4', 'drag end');
});



// sample 5: 上传前获得token

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});

up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console5', 'add file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console5', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console5', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console5', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console5', 'file "'+ file.name +'" error:' + error.toString());
        })
});

up.getPickerCollector().addArea(document.getElementById('clickarea3'));

up.on(Events.FILE_UPLOAD_PREPARING, function (request) {
    var i = jQuery.Deferred();
    output('#console5', 'upload requeset preparing...');
    jQuery.getJSON("http://test.yanbingbing.com/token.php", function (json) {
        output('#console5', 'get token:'+ json.token);
        request.setParam('token', json.token);
        output('#console5', 'upload request params:'+ request.getParams().toString());
        i.resolve();
    });
    return i;
});





// sample 6: 秒传

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});

up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console6', 'add file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console6', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console6', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console6', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console6', 'file "'+ file.name +'" error:' + error.toString());
        })
});

up.getPickerCollector().addArea(document.getElementById('clickarea4'));

up.on(Events.FILE_UPLOAD_PREPARING, function (request) {
    var file = request.getFile();
    output('#console6', 'md5 file "'+file.name+'" start');
    file.md5().done(function (md5) {
        output('#console6', 'md5 file "'+file.name+'" done:' + md5);
        output('#console6', 'query ' + md5 + ' from server...');
        jQuery.getJSON('http://test.yanbingbing.com/head.php', {md5:md5}).done(function (ret) {
            if (ret.code === 0 && ret.data) {
                output('#console6', 'found file with md5:' + md5+' info:' + JSON.stringify(ret));
                file.complete(ret);
                output('#console6', 'complete "'+file.name+'" by query');
            }
        });
    });
});


// sample 7: 分片上传

up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    chunkSize: '400k', // 400k
    chunkEnable: true,
    chunkProcessThreads: 2,
    autoPending: true
});

up.getPickerCollector().addArea(document.getElementById('clickarea5'));

up.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console7', 'add file: '+ file.name);
    file.on(Events.FILE_STATUS_CHANGE, function () {
        output('#console7', 'file "'+file.name+'" status:'+file.getStatusName())
    });
    file.session()
        .progress(function (progress) {
            output('#console7', 'file "'+ file.name +'" progress:' + progress.percentage);
        })
        .done(function (response) {
            output('#console7', 'file "'+ file.name +'" success:' + JSON.stringify(response.getJson()))
        })
        .fail(function (error) {
            output('#console7', 'file "'+ file.name +'" error:' + error.toString());
        })
});

up.on(Events.FILE_UPLOAD_PREPARING, function (request) {
    // 分块上传准备 transaction start
    if (request.isChunkEnable()) {
        var i = jQuery.Deferred(),
            file = request.getFile(),
            chunkSize = request.getChunkSize();
        console.info(chunkSize);
        request.setUrl('http://test.yanbingbing.com/chunk.php');
        output('#console7', '"'+file.name+'" chunk enabled, turn url to:'+request.getUrl());

        output('#console7', 'create transaction with params:'+ JSON.stringify({
            size: file.size,
            ext: file.ext,
            chunkTotal: Math.ceil(file.size / chunkSize)
        }));
        // 创建分块上传会话
        jQuery.getJSON('http://test.yanbingbing.com/transaction.php', {
            size: file.size,
            ext: file.ext,
            chunkTotal: Math.ceil(file.size / chunkSize)
        }).done(function (ret) {
            // 会话唯一ID
            request.setParam('transId', ret.data.transId);
            output('#console7', 'transaction unique id:'+ ret.data.transId);
            i.resolve();
        });

        return i;
    }
}).on(Events.CHUNK_UPLOAD_PREPARING, function (request) {
    if (request.isMultiChunk()) {
        var params = request.getParams();
        var transId = request.getParam('transId', true);
        console.info(request.getIndex());
        output('#console7', 'transaction "'+transId+'" prepare upload sequence:'+ (request.getIndex() + 1));
        // 设置分片序号
        request.setParam('sequence', request.getIndex() + 1);
    }
}).on(Events.CHUNK_UPLOAD_COMPLETING, function (response) {
    var request = response.getChunkRequest();
    if (request.isMultiChunk()) {
        var params = request.getParams();
        var transId = params.getParam('transId', true);
        var sequence = params.getParam('sequence', true);
        output('#console7', 'transaction "'+transId+'"  sequence:'+ sequence + ' complete with:'+JSON.stringify(response.getJson()));
    }
}).on(Events.FILE_UPLOAD_COMPLETING, function (response) {
    if (response.isFromMultiChunkResponse()) {
        var i = jQuery.Deferred();
        var params = response.getFileRequest().getParams();
        var transId = params.getParam('transId', true);
        output('#console7', 'transaction "'+transId+'" all chunk upload complete');
        var endurl = 'http://test.yanbingbing.com/transaction.php?transId='+ transId;
        output('#console7', 'request "'+endurl+'", end the transaction "'+transId+'"...');
        jQuery.post(endurl).done(function (ret) {
            response.setResponse(ret);
            output('#console7', 'transaction "'+transId+'" result:'+JSON.stringify(response.getJson()));
            i.resolve();
        });
        return i;
    }
});

// sample 8: 事件监听
up = new Core({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php',
    autoPending: true
});

up.getPickerCollector().addArea(document.getElementById('clickarea6'));

// 队列上传开始
up.on(Events.QUEUE_UPLOAD_START, function () {
    output('#console8', 'Events.QUEUE_UPLOAD_START');
    console.info(Events.QUEUE_UPLOAD_START);
})
// 队列上传结束
.on(Events.QUEUE_UPLOAD_END, function () {
    output('#console8', 'Events.QUEUE_UPLOAD_END');
    console.info(Events.QUEUE_UPLOAD_END);
})
// 队列错误
.on(Events.QUEUE_ERROR, function (error) {
    output('#console8', 'Events.QUEUE_ERROR Params:(Error)');
    console.info(Events.QUEUE_ERROR, error);
})
// 队列添加
.on(Events.QUEUE_FILE_ADDED, function (file) {
    output('#console8', 'Events.QUEUE_FILE_ADDED Params:(File)');
    console.info(Events.QUEUE_ERROR, file);
})
// 文件被过滤
.on(Events.QUEUE_FILE_FILTERED, function (file, error) {
    output('#console8', 'Events.QUEUE_FILE_FILTERED Params:(File, Error)');
    console.info(Events.QUEUE_FILE_FILTERED, file, error);
})
// 队列统计变化
.on(Events.QUEUE_STAT_CHANGE, function (stat) {
    output('#console8', 'Events.QUEUE_STAT_CHANGE Params:(Stat)');
    console.info(Events.QUEUE_STAT_CHANGE, stat.stat());
})
// 文件上传开始
.on(Events.FILE_UPLOAD_START, function (file) {
    output('#console8', 'Events.FILE_UPLOAD_START Params:(file)');
    console.info(Events.FILE_UPLOAD_START, file);
})
// 文件上传准备中
.on(Events.FILE_UPLOAD_PREPARING, function (request) {
    output('#console8', 'Events.FILE_UPLOAD_PREPARING Params:(FileRequest)');
    console.info(Events.FILE_UPLOAD_PREPARING, request);
})
// 文件上传准备完毕
.on(Events.FILE_UPLOAD_PREPARED, function (file) {
    output('#console8', 'Events.FILE_UPLOAD_PREPARED Params:(File)');
    console.info(Events.FILE_UPLOAD_PREPARED, file);
})
// 文件块上传准备中
.on(Events.CHUNK_UPLOAD_PREPARING, function (request) {
    output('#console8', 'Events.CHUNK_UPLOAD_PREPARING Params:(ChunkRequest)');
    console.info(Events.CHUNK_UPLOAD_PREPARING, request);
})
// 文件块上传完成中
.on(Events.CHUNK_UPLOAD_COMPLETING, function (response) {
    output('#console8', 'Events.CHUNK_UPLOAD_COMPLETING Params:(ChunkResponse)');
    console.info(Events.CHUNK_UPLOAD_COMPLETING, response);
})
// 文件上传进度
.on(Events.FILE_UPLOAD_PROGRESS, function (file, progress) {
    output('#console8', 'Events.FILE_UPLOAD_PROGRESS Params:(File, Progress)');
    console.info(Events.FILE_UPLOAD_PROGRESS, file, progress);
})
// 文件上传结束
.on(Events.FILE_UPLOAD_END, function (file) {
    output('#console8', 'Events.FILE_UPLOAD_END Params:(File)');
    console.info(Events.FILE_UPLOAD_END, file);
})
// 文件上传完成中
.on(Events.FILE_UPLOAD_COMPLETING, function (response) {
    output('#console8', 'Events.FILE_UPLOAD_COMPLETING Params:(FileResponse)');
    console.info(Events.FILE_UPLOAD_COMPLETING, response);
})
// 文件上传成功
.on(Events.FILE_UPLOAD_SUCCESS, function (file, response) {
    output('#console8', 'Events.FILE_UPLOAD_SUCCESS Params:(File, FileResponse)');
    console.info(Events.FILE_UPLOAD_SUCCESS, file, response);
})
// 文件上传错误
.on(Events.FILE_UPLOAD_ERROR, function (file, error) {
    output('#console8', 'Events.FILE_UPLOAD_ERROR Params:(File, Error)');
    console.info(Events.FILE_UPLOAD_ERROR, file, error);
})
// 文件上传完成
.on(Events.FILE_UPLOAD_COMPLETED, function (file, status) {
    output('#console8', 'Events.FILE_UPLOAD_COMPLETED Params:(File, Status)');
    console.info(Events.FILE_UPLOAD_COMPLETED, file, status);
})
// 文件取消
.on(Events.FILE_CANCEL, function (file) {
    output('#console8', 'Events.FILE_CANCEL Params:(File)');
    console.info(Events.FILE_CANCEL, file);
})
// 文件状态变化
.on(Events.FILE_STATUS_CHANGE, function (file, status) {
    output('#console8', 'Events.FILE_STATUS_CHANGE Params:(File, Status)');
    console.info(Events.FILE_STATUS_CHANGE, file, status);
});
