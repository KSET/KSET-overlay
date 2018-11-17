module.exports = class Settings {

    constructor(args) {
        this._args = require('minimist')(args || process.argv.slice(2));
        this._password = '';
        this._secret = '';
    }

    get port() {
        const { port } = this._args;

        return this._normalizePort(port) || 3000;
    }

    get host() {
        const { host } = this._args;

        return String(host || 'localhost');
    }

    get defaultUrl() {
        return `http://${this.host}:${this.port}`;
    }

    get password() {
        const { password } = this._args;

        return String(password || this._generatePassword());
    }

    get baseUrl() {
        const { baseUrl } = this._args;

        return String(baseUrl || this.defaultUrl);
    }

    get maxMessageLength() {
        const { maxMessageLength } = this._args;

        return Number(maxMessageLength || 120);
    }

    get secret() {
        const { secret } = this._args;

        return String(secret || this._generateSecret());
    }

    _generatePassword() {
        if (this._password)
            return this._password;

        this._password = require('password-generator')(128, false);

        return this._password;
    }

    _generateSecret() {
        if (this._secret)
            return this._secret;

        this._secret = require('password-generator')(512, false);

        return this._secret;
    }

    _normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }
};
