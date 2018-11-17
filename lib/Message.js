module.exports = class Message {
    constructor(text, date = null) {
        this.text = text;
        this.maxLength = 120;

        if (!date)
            this.date = new Date().getTime();
        else
            this.date = new Date(date).getTime();
    }

    withMaxLength(maxLength) {
        this.maxLength = Number(maxLength);

        return this;
    }
};
