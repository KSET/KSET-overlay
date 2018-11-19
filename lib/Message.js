const passwordGenerator = require('password-generator');

module.exports = class Message {
    constructor(text, date = new Date().getTime()) {
        this.id = Message._generateId();
        this.text = text;
        this.maxLength = 120;
        this.date = new Date(date).getTime();
    }

    get text() {
        const { _text = '' } = this;

        return _text.substr(0, this.maxLength);
    }

    set text(value) {
        this._text = String(value);
    }

    withMaxLength(maxLength) {
        this.maxLength = Number(maxLength);

        return this;
    }

    inspect() {
        const { id, text, date, maxLength } = this;

        return { id, text, date, maxLength };
    }

    static _generateId() {
        return passwordGenerator(128, false) + new Date().getTime();
    }
};
