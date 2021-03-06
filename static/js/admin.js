import io  from 'socket.io-client/dist/socket.io';
import Vue from 'vue/dist/vue.esm';

window.App = ({ messages = [], settings = {}, changeableSettings = [] }) => {
    const socket = io();

    function objectDiff(old, changed) {
        return (
            Object.entries(old)
                  .filter(([ k, v ]) => changed[ k ] !== v)
                  .reduce((acc, [ k ]) => Object.assign(acc, { [ k ]: changed[ k ] }), {})
        );
    }

    let sendSettings = true;
    const $data = new Vue(
        {
            data: {
                messages: messages,
                settings: settings,
            },
            watch: {
                settings(changed, old) {
                    const newSettings = objectDiff(old, changed);

                    if (sendSettings)
                        socket.emit('set settings', newSettings);
                    else
                        sendSettings = true;
                },
                messages(changed) {
                    if (changed.length > 10)
                        changed.shift();
                },
            },

            methods: {
                fetchMessages() {
                    socket.emit('get messages', (messages) => {
                        if (messages.length === 0)
                            return;

                        while (this.messages.length && this.messages[ 0 ].id !== messages[ 0 ].id)
                            this.messages.shift();

                        for (const message of this.messages) {
                            if (messages.length === 0)
                                break;

                            if (message.id !== messages[ 0 ].id)
                                break;

                            messages.shift();
                        }

                        Vue.set(this, 'messages', [ ...this.messages, ...messages ]);
                    });
                },

                fetchSettings() {
                    socket.emit('get settings', (settings) => Vue.set(this, 'settings', settings));
                },

                editMessage(message) {
                    const messageIndex = this.messages.findIndex(({ id }) => id === message.id);

                    if (messageIndex < 0)
                        return;

                    Vue.set(this.messages, messageIndex, message);
                },

                deleteMessage(id) {
                    const newMessages = this.messages.filter((message) => message.id !== id);

                    Vue.set(this, 'messages', newMessages);
                },
            },
        });

    Vue.component('notification-form', {
        //language=Vue
        template: `
            <form action="" method="POST" @submit.prevent="handleSubmit" class="chat-message-form">
                <fieldset>
                    <legend>Send Notification</legend>
                    <input type="text" name="title" v-model="title" placeholder="Title" id="title" ref="input">
                    <input type="text" name="message" v-model="text" placeholder="Text" id="message" ref="input">
                    <input type="submit" value="Send">
                </fieldset>
            </form>
        `,
        data() {
            return {
                title: '',
                text: '',
            };
        },
        computed: {
            notification() {
                return {
                    title: this.title,
                    text: this.text,
                };
            },
        },
        methods: {
            handleSubmit() {
                socket.emit('add notification', this.notification, (success) => {
                    if (!success)
                        return;

                    this.title = '';
                    this.text = '';
                });
            },
        },
    });

    Vue.component('settings-form', {
        //language=Vue
        template: `
            <form v-if="Object.keys(this.settings).length > 0" action="" method="POST" @submit.prevent="handleSubmit" class="chat-message-form">
                <fieldset>
                    <legend>Settings</legend>
                    <div v-for="(value, key) in this.settings">
                        <input type="text" :id="'setting-' + key" :name="key" v-model="settings[key]">
                        <label :for="'setting-' + key">{{ key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1 ').toLowerCase().replace(/^./, str => str.toUpperCase()) }}</label>
                    </div>
                    <input type="submit" value="Change">
                </fieldset>
            </form>
        `,
        data() {
            return {
                settings: this.getChangeable($data.settings),
            };
        },
        computed: {
            changed() {
                const old = $data.settings;
                const delta = this.getDelta(old, this.settings);

                return this.getChangeable(delta);
            },
            newSettings() {
                return Object.assign({}, $data.settings, this.changed);
            },
            globalSettings() {
                return $data.settings;
            },
        },
        watch: {
            globalSettings: {
                handler(globalSettings) {
                    const newSettings = Object.entries(objectDiff(this.settings, globalSettings));

                    if (newSettings.length === 0)
                        return;

                    for (const [ k, v ] of newSettings)
                        Vue.set(this.settings, k, v);
                },
                deep: true,
            },
        },
        methods: {
            handleSubmit() {
                if (Object.keys(this.changed).length === 0)
                    return;

                Vue.set($data, 'settings', this.newSettings);
            },
            changeableKeys() {
                return changeableSettings;
            },
            getChangeable(settings, settingsList = this.changeableKeys(), asObject = true) {
                const newList =
                    (settingsList || this.changeableKeys() || [])
                        .map((key) => ([ key, settings[ key ] ]))
                        .filter(([ _, v ]) => v !== undefined);

                if (!asObject)
                    return newList;

                return newList.reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {});
            },
            getDelta(old, changed) {
                return objectDiff(old, changed);
            },
        },
    });

    Vue.component('container', {
        //language=Vue
        template: `
            <div id="container">
                <notification-form />
                <settings-form />
                <message-form />
                <message-add-form />
            </div>
        `,
    });

    Vue.component('message-form', {
        //language=Vue
        template: `
            <div class="message-form-container">
                <message-input v-if="messages.length > 0" v-for="message in messages" :message="message" :key="message.id" />
            </div>
        `,
        computed: {
            messages() {
                return $data.messages;
            },
        },
    });

    Vue.component('message-input', {
        //language=Vue
        template: `
            <form action="admin/edit/message/" method="POST" @submit.prevent="handleSubmit" ref="form">
                <input type="text" v-model="message.text" :disabled="this.disabled" />
                <input type="submit" value="Edit" :disabled="this.disabled">
                <input type="submit" value="Delete" :disabled="this.disabled" @click.capture="handleDelete">
            </form>
        `,
        props: [ 'message' ],
        data() {
            return {
                disabled: false,
            };
        },
        computed: {
            submitUrl() {
                return this.$refs[ 'form' ].action;
            },
        },
        methods: {
            handleSubmit() {
                if (this.disabled)
                    return;

                this.disabled = true;

                socket.emit('edit message', this.message, () => {
                    this.disabled = false;
                });
            },
            handleDelete() {
                if (this.disabled)
                    return;

                this.disabled = true;

                socket.emit('delete message', this.message.id, (id) => $data.deleteMessage(id));
            },
        },
    });

    Vue.component('message-add-form', {
        //language=Vue
        template: `
            <div class="message-add-form-container">
                <form action="admin/add/message/" method="POST" @submit.prevent="handleSubmit" ref="form">
                    <input type="text" v-model="text" :disabled="this.disabled" />
                    <input type="submit" value="Send" :disabled="this.disabled">
                </form>
            </div>
        `,
        data() {
            return {
                text: '',
            };
        },
        methods: {
            handleSubmit() {
                if (this.disabled)
                    return;

                this.disabled = true;

                socket.emit('add message admin', this.text, (success) => {
                    this.disabled = false;

                    if (success)
                        this.text = '';
                });
            },
        },
    });

    const app = new Vue(
        {
            el: '#container',
            mounted() {
                $data.fetchMessages();
            },
        });

    socket.on('new message', () => $data.fetchMessages());
    socket.on('edit message', (message) => $data.editMessage(message));
    socket.on('delete message', (id) => $data.deleteMessage(id));

    socket.on('settings change', (newSettings) => {
        sendSettings = false;
        Vue.set($data, 'settings', newSettings);
    });

    return app;
};
