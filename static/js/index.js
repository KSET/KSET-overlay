import io from 'socket.io-client/dist/socket.io';

(() => {
    const socket = io();
    const form = document.getElementById('chat-message-form');
    const input = document.getElementById('chat-message-input');

    let timeout = 0;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const { value } = input;

        if (!value)
            return;

        socket.emit('message', value.trim(), (sent, meta) => {
            if (sent)
                input.value = '';

            const el = document.querySelector('.meta-data');
            el.innerText = `${meta.left}/${meta.max}`;

            clearTimeout(timeout);
            setTimeout(async () => {
                const data = await fetch('/data.json').then((res) => res.json());

                if (!data.max)
                    Object.assign(data, meta);

                el.innerText = `${data.left}/${data.max}`;
            }, timeout);
        });
    });
})();
