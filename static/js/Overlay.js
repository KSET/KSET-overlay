import { Marquee } from 'dynamic-marquee';
import io          from 'socket.io-client/dist/socket.io';
import { Queue }   from './src/Queue';

/**
 * @export
 */
class Overlay {
    constructor(marqueeElement, clockElement, notificationElement) {
        this.socket = io();
        this.queue = new Queue();
        this.notifications = new Queue();
        this.marquee = new Marquee(marqueeElement, { rate: -150 });
        this.clock = clockElement;
        this.$notification = notificationElement;
        this.notificationShown = false;
        this._onNotificaionShown = new Queue();
        this._onNotificaionHidden = new Queue();

        this._addToMarquee(this._promoMessage());
        this._register();
    }

    _getNotificationOpacity() {
        return Number(window.getComputedStyle(this.$notification).getPropertyValue('opacity'));
    }

    _registerNotificationShownHandler() {
        const opacity = this._getNotificationOpacity();

        if (opacity === 1)
            this.notificationShown = true;

        const transitionEvent = this._whichTransitionEvent();

        if (!transitionEvent)
            return;

        this.$notification.addEventListener(transitionEvent, () => {
            const shown = Boolean(this._getNotificationOpacity());
            this.notificationShown = shown;

            let tmp;
            if (shown) {
                while (tmp = this._onNotificaionShown.pop())
                    if (tmp instanceof Function)
                        tmp();
            } else {
                while (tmp = this._onNotificaionHidden.pop())
                    if (tmp instanceof Function)
                        tmp();
            }
        });
    }

    _showNotification() {
        const { $notification, notifications, notificationShown } = this;

        if (notificationShown)
            return;

        const notification = notifications.pop();

        if (!notification)
            return;

        $notification.querySelector('.title').innerText = notification.title;
        $notification.querySelector('.text').innerText = notification.text;
        $notification.style.opacity = 1;
        this.notificationShown = true;

        setTimeout(() => {
            this._onNotificaionHidden.push(() => {
                this._showNotification();
            });

            $notification.style.opacity = 0;
        }, 5000);
    };

    _promoMessage() {
        return { text: 'Pošaljite svoje poruke!' };
    }

    _queueHasElements() {
        return Boolean(this.queue.length());
    }

    _add(message, withDelimiter = false) {
        const { marquee } = this;

        if (!this._queueHasElements() && marquee.isWaitingForItem())
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

        fetch('./messages.json')
            .then((res) => res.json())
            .then((messages) => {
                messages.forEach((message) => this._addToQueue(message));
            });

        socket.on('new message', (message) => {
            this._add(message);
        });

        socket.on('edit message', (message) => {
            const index = this.queue.queue.findIndex(({ id }) => message.id === id);

            if (index < 0)
                return;

            this.queue.queue[ index ] = message;
        });

        socket.on('delete message', (id) => {
            this.queue.queue = this.queue.queue.filter((message) => message.id !== id);
        });

        socket.on('add notification', (notification) => {
            this.notifications.push(notification);
            this._showNotification();
        });

        marquee.onItemRequired(({ immediatelyFollowsPrevious }) => {
            if (!this._queueHasElements())
                return;

            this._addToMarquee(this._getFromQueue(), immediatelyFollowsPrevious);
        });

        marquee.onAllItemsRemoved(() => this._addToMarquee(this._promoMessage()));

        this._registerNotificationShownHandler();
    }

    _whichTransitionEvent() {
        const el = window.getComputedStyle(document.createElement('div'));
        const transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd',
        };

        const keys = Object.keys(transitions);

        for (const t of keys) {
            if (el[ t ] !== undefined)
                return transitions[ t ];
        }
    }
}

window.Overlay = Overlay;
