class _Error extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

class AbortError extends _Error {
    constructor(message) {
        super(message);
        this.name = 'AbortError';
    }
}

class TimeoutError extends _Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}

class NetworkError extends _Error {
    constructor(status, message) {
        super(message);
        this.name = 'NetworkError';
        this.status = status;
    }
}

class QueueLimitError extends _Error {
    constructor() {
        super('queue limit');
        this.name = 'QueueLimitError';
    }
}

class FilterError extends _Error {
    constructor(file, message) {
        super(message);
        this.name = 'FilterError';
        this.file = file;
    }
}

class DuplicateError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'DuplicateError';
    }
}

class FileExtensionError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'FileExtensionError';
    }
}

class FileSizeError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'FileSizeError';
    }
}


module.exports = {AbortError, TimeoutError, NetworkError,
    QueueLimitError, FilterError, DuplicateError, FileExtensionError, FileSizeError};
