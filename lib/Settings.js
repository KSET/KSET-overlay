module.exports = class Settings {

    constructor(args) {
        this._args = require('minimist')(args || process.argv.slice(2));
        this._password = '';
    }

    get port() {
        const { port } = this._args;

        return this._normalizePort(port) || 3000;
    }

    get host() {
        const { host } = this._args;

        return String(host || 'localhost');
    }

    get password() {
        const { password } = this._args;

        return String(password || this._generatePassword());
    }

    _generatePassword() {
        if (this._password)
            return this._password;

        this._password = require('password-generator')(128, false);

        return this._password;
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
