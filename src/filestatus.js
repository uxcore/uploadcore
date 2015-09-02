export default {
    ALL: 255, // 所有状态

    PROCESS: 31, // INITED -> COMPLETE
    INITED: 1, // 初始状态
    QUEUED: 2, // 进入队列
    PENDING: 4, // 队列中等待
    PROGRESS: 8, // 上传中
    COMPLETE: 16, // 上传完成, 等待后续处理

    SUCCESS: 32,  // 上传成功
    ERROR: 64, // 上传出错
    CANCELLED: 128  // 上传取消 和 queued 相反, 退出队列
};
