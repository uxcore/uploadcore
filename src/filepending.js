import Set from './set';

export default class FilePending {
    constructor(threads) {
        this.threads = threads || 2;
        this.heading = new Set;
        this.pending = new Set;
    }

    add(file) {
        if (!this.pending.add(file)) return false;

        file.session().always(() => this.pending.remove(file));

        this.load();

        return true;
    }

    size() {
        return this.pending.size + this.heading.size;
    }

    process(file) {
        if (!this.heading.add(file)) return;

        file.session().always(() => {
            this.heading.remove(file);
            this.load();
        });
    }

    load () {
        var file;
        while (this.heading.size < this.threads && (file = this.pending.shift())) {
            if (file.prepare()) {
                this.process(file);
            }
        }
    }
}
