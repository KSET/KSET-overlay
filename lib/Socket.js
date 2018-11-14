const Message = require('./Message');

module.exports = class Socket {
    constructor(io = null) {
        this.messages = [];
        this.defaultMessages = [ 'Pošaljite poruku!', 'KSET je lit', 'KOMP je najbolja sekcija' ].map((text) => new Message(text));

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
            socket.on('message', (text, cb = (() => 0)) => {
                const message = this.addMessage(text);

                this.send('message:new', message);

                cb(message);
            });
        });
    }

    send(name, data = null) {
        const { io } = this;

        io.emit(name, data);
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
