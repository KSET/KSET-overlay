module.exports = class Message {
    constructor(text, date = null) {
        this.text = text;
        this.maxLength = 120;

        if (!date)
            this.date = new Date().getTime();
        else
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
        const { text, maxLength } = this;

        return { text, maxLength };
    }
};
