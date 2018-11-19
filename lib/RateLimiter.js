const RateLimiterEntry = require('./RateLimiter/RateLimiterEntry');

module.exports = class RateLimiter {

    constructor(timeframe = 60000, perTimeframe = 60) {
        this._LIFETIME_MS = 30 * 60 * 1000;

        this._interval = 0;
        /**
         * @type {Object.<String, RateLimiterEntry>}
         * @private
         */
        this._data = {};

        this._timeframe = timeframe;
        this._perTimeframe = perTimeframe;

        this._register();
    }

    get(...ids) {
        if (ids.length === 0)
            return Object.keys(this._data);

        if (ids.length === 1)
            return this._data[ ids.pop() ];

        return Object.entries(this._data)
                     .filter(([ k ]) => ids.includes(k))
                     .reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {});
    }

    getOrCreate(id, fn, timeframe = this._timeframe, perTimeframe = this._perTimeframe) {
        const existing = this.get(id);

        if (existing)
            return existing;

        return this.limit(id, fn, timeframe, perTimeframe);
    }

    update({ id }) {
        this._data[ id ].value += 1;
    }

    limit(id, fn, timeframe = this._timeframe, perTimeframe = this._perTimeframe) {
        const entry = new RateLimiterEntry(id, fn, timeframe, perTimeframe);

        if (this._data[ id ])
            this._data[ id ].destroy();

        this._data[ id ] = entry;

        return entry;
    }

    updatePerTimeframe(perTimeframe) {
        this._perTimeframe = perTimeframe;

        this.get()
            .forEach((key) => {
                this._data[ key ].max = perTimeframe;
            });

        return this;
    }

    _register() {
        if (this._interval)
            clearInterval(this._interval);

        this._interval = setInterval(this._GC.bind(this), 1000);
    }

    _GC() {
        const entries = Object.entries(this._data);

        entries
            .filter(([ _, value ]) => Math.abs(new Date().getTime() - value.lastChanged) >= this._LIFETIME_MS)
            .forEach(([ _, v ]) => v.destroy());

        this._data =
            entries
                .filter(([ _, value ]) => Math.abs(new Date().getTime() - value.lastChanged) < this._LIFETIME_MS)
                .reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {});
    }

};
