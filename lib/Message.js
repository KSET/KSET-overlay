module.exports = class Message {
    constructor(text, date = null) {
        this.text = text;

        if (!date)
            this.date = new Date().getTime();
        else
            this.date = new Date(date).getTime();
    }
};
