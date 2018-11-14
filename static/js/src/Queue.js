export class Queue {
    constructor() {
        this.queue = [];
    }

    length() {
        return this.queue.length;
    }

    push(element) {
        this.queue.push(element);
    }

    pop() {
        return this.queue.shift();
    }
}
