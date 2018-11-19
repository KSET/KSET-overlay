const passwordGenerator = require('password-generator');

module.exports = class Notification {
    constructor({ text, title = '' }, date = new Date().getTime()) {
        this.text = text;
        this.title = title;
        this.date = new Date(date).getTime();
        this.id = Notification._generateId();
    }

    inspect() {
        const { id, text, title, date } = this;

        return { id, title, text, date };
    }

    static _generateId() {
        return passwordGenerator(128, false) + new Date().getTime();
    }
};
