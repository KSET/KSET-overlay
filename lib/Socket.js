const Message = require('./Message');
const RateLimiter = require('./RateLimiter');
const Settings = require('./settings');

module.exports = class Socket {
    constructor(io = null) {
        this.messages = [];
        this.defaultMessages = [ 'Pošaljite poruku!', 'KSET je lit', 'KOMP je najbolja sekcija' ].map((text) => new Message(text));
        this.rateLimiter = new RateLimiter(60000, 5);

        if (io)
            this.init(io);
    }

    static get maxMessagesLength() {
        return 10;
    }

    get fillMessages() {
        const count = Math.max(0, Socket.maxMessagesLength - this.messages.length);

        return this.defaultMessages.slice(0, count);
    }

    init(io) {
        this.io = io;
        this.register();
    }

    register() {
        const { io } = this;

        io.on('connection', (socket) => {
            const cookieString = socket.handshake.headers.cookie;
            const cookies =
                cookieString
                    .split('; ')
                    .map((cookie) => {
                        const [ key, ...value ] = cookie.split('=');

                        return [ key, value.join('=') ];
                    })
                    .reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {});

            socket.join(cookies.id);

            socket.on('message', (text, cb = (() => 0)) => {
                const { id } = cookies;

                const sent = this.sendMessage(id, text);
                const entry = this.rateLimiter.get(id).inspect();

                io.to(id).emit('meta', entry);

                cb(sent, entry);
            });

            socket.on('meta', (cb = (() => 0)) => {
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
        const message = new Message(text).withMaxLength(Settings.maxMessageLength);

        this.messages.unshift(message);

        if (this.messages.length > Socket.maxMessagesLength)
            this.messages.pop();

        return message;
    }

    getMessages() {
        const messages = this.messages.slice();
        const fillerMessages = this.fillMessages;

        return [ ...messages, ...fillerMessages ].reverse();
    }
};
