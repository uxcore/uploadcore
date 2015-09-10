class _Error extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

export class AbortError extends _Error {
    constructor(message) {
        super(message);
        this.name = 'AbortError';
    }
}

export class TimeoutError extends _Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}

export class NetworkError extends _Error {
    constructor(status, message) {
        super(message);
        this.name = 'NetworkError';
        this.status = status;
    }
}

export class QueueLimitError extends _Error {
    constructor() {
        super('queue limit');
        this.name = 'QueueLimitError';
    }
}

export class FilterError extends _Error {
    constructor(file, message) {
        super(message);
        this.name = 'FilterError';
        this.file = file;
    }
}

export class DuplicateError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'DuplicateError';
    }
}

export class FileExtensionError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'FileExtensionError';
    }
}

export class FileSizeError extends FilterError {
    constructor(file, message) {
        super(file, message);
        this.name = 'FileSizeError';
    }
}
