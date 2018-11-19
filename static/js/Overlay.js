import { Marquee } from 'dynamic-marquee';
import io          from 'socket.io-client/dist/socket.io';
import { Queue }   from './src/Queue';

/**
 * @export
 */
class Overlay {
    constructor(marqueeElement, clockElement) {
        this.socket = io();
        this.queue = new Queue();
        this.marquee = new Marquee(marqueeElement, { rate: -150 });
        this.clock = clockElement;

        this._addToMarquee(this._promoMessage());
        this._register();
    }

    _promoMessage() {
        return { text: 'Pošaljite svoje poruke!' };
    }

    _queueHasElements() {
        return Boolean(this.queue.length());
    }

    _add(message, withDelimiter = false) {
        const { marquee } = this;

        if (marquee.isWaitingForItem())
            this._addToMarquee(message, withDelimiter);
        else
            this._addToQueue(message);
    }

    _addToMarquee(message, withDelimiter = false) {
        const { text } = message;

        const el = document.createElement('div');
        el.innerText = text;

        if (withDelimiter) {
            el.style.paddingLeft = '0.4em';
            el.innerText = `+++ ${el.innerText}`;
        }

        this.marquee.appendItem(el);
    }

    _addToQueue(message) {
        this.queue.push(message);
    }

    _getFromQueue() {
        return this.queue.pop();
    }

    _register() {
        const { socket, marquee, clock } = this;

        setInterval(() => {
            const now = new Date();
            const padStart = (num) => String(num).padStart(2, '0');

            clock.innerText = `${padStart(now.getHours())}:${padStart(now.getMinutes())}`;
        }, 1000);

        fetch('/messages.json')
            .then((res) => res.json())
            .then((messages) => {
                messages.forEach((message) => this._addToQueue(message));
            });

        socket.on('new message', (message) => {
            this._add(message);
        });

        marquee.onItemRequired(({ immediatelyFollowsPrevious }) => {
            if (!this._queueHasElements())
                return;

            this._addToMarquee(this._getFromQueue(), immediatelyFollowsPrevious);
        });

        marquee.onAllItemsRemoved(() => this._addToMarquee(this._promoMessage()));
    }
}

window.Overlay = Overlay;
