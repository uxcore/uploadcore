export default class Set {
    constructor() {
        this._set = [];
    }

    /**
     * 项目总数
     *
     * @returns {Number}
     */
    get size() {
        return this._set.length;
    }

    /**
     * 从头部取出一项
     *
     * @returns {*}
     */
    shift() {
        return this._set.shift();
    }

    /**
     * 从尾部取出一项
     *
     * @returns {*}
     */
    pop() {
        return this._set.pop();
    }

    /**
     * 获得所有项
     *
     * @returns {Array}
     */
    toArray() {
        return this._set.slice(0);
    }

    /**
     * 添加一项
     *
     * @param item
     * @returns {boolean} success if true
     */
    add(item) {
        if (this.has(item)) {
            return false;
        }
        this._set.push(item);
        return true;
    }

    /**
     * 是否存在该项
     *
     * @param item
     * @returns {boolean}
     */
    has(item) {
        return this._set.indexOf(item) > -1;
    }

    /**
     * 删除某项
     *
     * @returns {boolean} success if true
     */
    remove(item) {
        var i = this._set.indexOf(item);
        if (i > -1) {
            this._set.splice(i, 1);
            return true;
        }
        return false;
    }

    /**
     * 清空
     */
    clear() {
        this._set = [];
    }
}
