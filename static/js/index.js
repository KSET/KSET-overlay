import io from 'socket.io-client/dist/socket.io';

(() => {
    const socket = io();
    const form = document.getElementById('chat-message-form');
    const input = document.getElementById('chat-message-input');

    socket.on('message:new', () => {
        fetch('/messages.json')
            .then((res) => res.json())
            .then(console.log);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const { value } = input;

        if (!value)
            return;

        socket.emit('message', value.trim(), (...args) => {
            console.info('|>', ...args);
            input.value = '';
        });
    });
})();
