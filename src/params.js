export default class Params {
    constructor(params) {
        if (Array.isArray(params)) {
            this.params = params.slice(0);
        } else if (typeof params === 'object') {
            this.params = [];
            for (let name in params) {
                if (params.hasOwnProperty(name)) {
                    this.params.push({name, value: params[name]});
                }
            }
        } else {
            this.params = [];
        }
    }

    setParam(name, value) {
        this.removeParam(name);
        this.addParam(name, value);
    }

    addParam(name, value) {
        this.params.push({name, value});
    }

    removeParam(name) {
        this.params = this.params.filter((param) => param.name !== name);
    }

    getParam(name, single) {
        let ret = this.params.filter((param) => param.name === name)
            .map((param) => param.value);

        if (single) {
            return ret.shift();
        }

        return ret;
    }

    clone() {
        return new Params(this.params);
    }

    toArray() {
        return this.params;
    }

    toString() {
        const params = this.params.map((param) => {
            return encodeURIComponent(param.name) + '=' + (param.value == null ? '' : encodeURIComponent(param.value));
        });

        return params.join('&'); //.replace( /%20/g, '+');
    }
}
