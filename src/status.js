exports.Status = {
    ALL: 255, // 所有状态

    PROCESS: 31, // INITED -> END
    INITED: 1, // 初始状态
    QUEUED: 2, // 进入队列
    PENDING: 4, // 队列中等待
    PROGRESS: 8, // 上传中
    END: 16, // 上传完成, 等待后续处理

    SUCCESS: 32,  // 上传成功
    ERROR: 64, // 上传出错
    CANCELLED: 128  // 上传取消 和 queued 相反, 退出队列
};

exports.StatusName = {
    1: 'inited',
    2: 'queued',
    4: 'pending',
    8: 'progress',
    16: 'end',
    32: 'success',
    64: 'error',
    128: 'cancelled'
};
