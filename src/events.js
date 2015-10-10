module.exports = {
    QUEUE_UPLOAD_START: 'queueuploadstart', // 队列上传开始
    QUEUE_UPLOAD_END: 'queueuploadend', // 队列上传结束
    QUEUE_FILE_ADDED: 'queuefileadded', // 队列添加了一个文件
    QUEUE_FILE_FILTERED: 'queuefilefiltered', // 队列过滤了一个文件
    QUEUE_ERROR: 'queueerror', // 队列错误
    QUEUE_STAT_CHANGE: 'statchange', // 统计发生变化

    FILE_UPLOAD_START: 'fileuploadstart', // 文件上传开始
    FILE_UPLOAD_PREPARING: 'fileuploadpreparing', // 文件上传准备时
    FILE_UPLOAD_PREPARED: 'fileuploadprepared', // 文件上传准备好了
    CHUNK_UPLOAD_PREPARING: 'chunkuploadpreparing', // 分块上传准备时
    CHUNK_UPLOAD_COMPLETING: 'chunkuploadcompleting', // 分块上传结束时
    FILE_UPLOAD_PROGRESS: 'fileuploadprogress', // 文件上传进度中
    FILE_UPLOAD_END: 'fileuploadend', // 文件上传结束
    FILE_UPLOAD_COMPLETING: 'fileuploadcompleting', // 文件上传结束时
    FILE_UPLOAD_SUCCESS: 'fileuploadsuccess', // 文件上传成功
    FILE_UPLOAD_ERROR: 'fileuploaderror', // 文件上传失败
    FILE_UPLOAD_COMPLETED: 'fileuploadcompleted', // 文件上传完成了

    FILE_CANCEL: 'filecancel', // 文件退出
    FILE_STATUS_CHANGE: 'filestatuschange' // 文件状态发生变化
};
