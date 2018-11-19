import Vue from 'vue/dist/vue';

import socket from './src/socket';

window.App = ({ rateLimiter, maxMessageLength = 69 }) => {
    const $data = new Vue(
        {
            data: {
                rateLimiter,
                maxMessageLength,
            },
            methods: {
                fetchRateLimiter() {
                    socket.emit('meta', (rateLimiter) => Vue.set(this, 'rateLimiter', rateLimiter));
                },
            },
            computed: {
                rateLimiterTime() {
                    return this.rateLimiter.time;
                },
            },
            watch: {
                rateLimiterTime(_, time) {
                    if (time <= 0)
                        this.fetchRateLimiter();
                },
            },
        });

    socket.on('meta', (meta) => {
        Vue.set($data, 'rateLimiter', meta);
    });

    socket.on('settings change', ({ maxMessageLength, messagesPerInterval }) => {
        if (maxMessageLength)
            Vue.set($data, 'maxMessageLength', maxMessageLength);

        if (messagesPerInterval)
            $data.fetchRateLimiter();
    });

    Vue.component('message-form', {
        //language=Vue
        template: `
            <form action="" method="POST" @submit.prevent="handleSubmit" class="chat-message-form">
                <input :maxlength="this.messageMaxLength" :disabled="!this.ready" type="text" name="text" ref="input" v-model="text" placeholder="Pošalji poruku :)">
                <span>{{ text.length }}/{{ messageMaxLength }}</span>
                <input :disabled="!this.ready || this.messageTooShort" type="submit" value="Pošalji!">
            </form>
        `,
        data() {
            return {
                text: '',
            };
        },
        methods: {
            handleSubmit() {
                socket.emit('add message', this.message, (sent, meta) => {
                    if (sent)
                        Vue.set(this, 'text', '');

                    Vue.set($data, 'rateLimiter', meta);
                });
            },
        },
        computed: {
            messageMaxLength() {
                return $data.maxMessageLength;
            },

            messageTooShort() {
                return this.message.length < 2;
            },

            ready() {
                return $data.rateLimiter.ready;
            },

            message() {
                return this.text.trim();
            },
        },
    });

    Vue.component('meta-data-timer', {
        //language=Vue
        template: `<span>Pričekaj {{ Math.ceil(left / 1000) }}s</span>`,
        data() {
            return {
                _interval: 0,
            };
        },
        computed: {
            left() {
                return $data.rateLimiter.time;
            },
        },
        created() {
            let previousTime = new Date().getTime();
            const interval = setInterval(() => {
                const { left } = this;

                if (left <= 0)
                    return;

                const now = new Date().getTime();
                const delta = now - previousTime;
                previousTime = now;

                Vue.set($data.rateLimiter, 'time', Math.max(0, left - delta));
            }, 100);

            Vue.set(this, '_interval', interval);
        },
        beforeDestroy() {
            clearInterval(this._interval);
        },
    });

    Vue.component('meta-data', {
        //language=Vue
        template: `
            <div class="meta-data">
                <span v-if="this.ready">{{ left }} / {{ max }}</span>
                <meta-data-timer v-else />
            </div>
        `,
        data() {
            return {
                _interval: 0,
            };
        },
        computed: {
            rateLimiter() {
                return $data.rateLimiter;
            },

            left() {
                return this.rateLimiter.left;
            },

            max() {
                return this.rateLimiter.max;
            },

            ready() {
                return this.rateLimiter.ready;
            },
        },

        mounted() {
            const interval = setInterval(() => {
                $data.fetchRateLimiter();
            }, 2000);

            Vue.set(this, '_interval', interval);
        },
        beforeDestroy() {
            clearInterval(this._interval);
        },
    });

    Vue.component('message-header', {
        //language=Vue
        template: `<h1 class="message-header">Pošalji poruku na AfterBrucifer!</h1>`,
    });

    Vue.component('container', {
        //language=Vue
        template: '<div id="container"><message-header /><meta-data /><message-form /></div>',
    });

    return new Vue(
        {
            el: '#container',
        });
};
