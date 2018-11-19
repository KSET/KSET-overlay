module.exports = class RateLimiterEntry {
    constructor(id, fn, timeframe = 60000, perTimeframe = 30) {
        this.id = id;
        this._value = 0;
        this.timeframe = timeframe;
        this.perTimeframe = perTimeframe;
        this.lastTick = new Date().getTime();
        this.lastChanged = new Date().getTime();

        this._setFn(fn);
        this._registerInterval();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this.lastChanged = new Date().getTime();
        this._value = value;
    }

    get ready() {
        return this._value < this.perTimeframe;
    }

    get can() {
        return this.ready;
    }

    get left() {
        return this.perTimeframe - this.value;
    }

    get timeExpired() {
        return new Date().getTime() - this.lastTick;
    }

    get timeLeft() {
        return this.timeframe - this.timeExpired;
    }

    get max() {
        return this.perTimeframe;
    }

    set max(value) {
        this.perTimeframe = Number(value || this.max);
    }

    get limitedFn() {
        return (...args) => {
            if (!this.ready)
                return false;

            this.run(...args);
            return true;
        };
    }

    run(...args) {
        return this.fn(...args);
    }

    clearInterval() {
        return clearInterval(this.interval);
    }

    destroy() {
        this.clearInterval();
    }

    inspect() {
        const entry = this;

        return {
            value: entry.value,
            ready: entry.ready,
            left: entry.left,
            max: entry.max,
            time: entry.timeLeft,
        };
    }

    _setFn(fn) {
        if (fn instanceof Function)
            this.fn = fn;
        else
            this.fn = () => null;
    }

    _registerInterval() {
        this.interval = setInterval(() => {
            this.lastTick = new Date().getTime();
            this._value = 0;
        }, this.timeframe);
    }
};
