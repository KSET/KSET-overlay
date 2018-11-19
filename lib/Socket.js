const Message = require('./Message');
const RateLimiter = require('./RateLimiter');
const Settings = require('./settings');

module.exports = class Socket {
    constructor(io = null) {
        this.messages = [ 'Pošaljite poruku!', 'KSET je lit', 'KOMP je najbolja sekcija' ].map((text) => new Message(text).inspect());
        this.rateLimiter = new RateLimiter(60000, 5);

        if (io)
            this.init(io);
    }

    static get maxMessagesLength() {
        return 10;
    }

    get settings() {
        return Settings.inspect();
    }

    get maxMessageLength() {
        return this.settings.maxMessageLength;
    }

    get secret() {
        return this.settings.secret;
    }

    init(io) {
        this.io = io;
        this.register();
    }

    getCookies(socket) {
        const cookieString = socket.handshake.headers.cookie || '';

        return (
            cookieString
                .split('; ')
                .map((cookie) => {
                    const [ key, ...value ] = cookie.split('=');

                    return [ key, value.join('=') ];
                })
                .reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {})
        );
    }

    register() {
        const { io } = this;

        io.on('connection', (socket) => {
            const cookies = this.getCookies(socket);

            socket.join(cookies.id);

            const fn = (() => 0);

            socket.on('message', (text, cb = fn) => {
                const { id } = cookies;

                const sent = this.sendMessage(id, text);
                const entry = this.rateLimiter.get(id).inspect();

                io.to(id).emit('meta', entry);

                cb(sent, entry);
            });

            socket.on('meta', (cb = fn) => {
                const { id } = cookies;
                const entry = this.rateLimiter.getOrCreate(id);

                cb(entry.inspect());
            });
        });
    }

    send(name, data = null) {
        const { io } = this;

        io.emit(name, data);
    }

    sendMessage(id, text = '') {
        text = text.trim();

        if (text.length < 2)
            return false;

        const message = this.addMessage(text);
        const entry = this.rateLimiter.getOrCreate(id);

        if (!entry.can)
            return false;

        this.rateLimiter.update(entry);

        this.send('message:new', message);
        return true;
    }

    addMessage(text) {
        const message =
            new Message(text)
                .withMaxLength(this.maxMessageLength)
                .inspect();

        this.messages.unshift(message);

        if (this.messages.length > Socket.maxMessagesLength)
            this.messages.pop();

        return message;
    }

    getMessages() {
        const messages = this.messages.slice();

        return messages.reverse();
    }
};
