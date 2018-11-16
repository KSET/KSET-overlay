const Message = require('./Message');
const RateLimiter = require('./RateLimiter');

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

            socket.on('message', (text, cb = (() => 0)) => {
                const sent = this.sendMessage(cookies.id, text);

                cb(sent);
            });
        });
    }

    send(name, data = null) {
        const { io } = this;

        io.emit(name, data);
    }

    sendMessage(id, text) {
        const message = this.addMessage(text);
        const entry = this.rateLimiter.getOrCreate(id);

        if (!entry.can)
            return false;

        this.rateLimiter.update(entry);

        console.log(`|> ${id}: ${entry.value}/${entry.max} [${entry.left}]`);

        this.send('message:new', message);
        return true;
    }

    addMessage(text) {
        const message = new Message(text);

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
