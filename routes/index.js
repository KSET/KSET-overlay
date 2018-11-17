const express = require('express');
const router = express.Router();
const { scripts: $scripts, styles: $styles } = require('../lib/assets');

/**
 * @param {Socket} Socket
 */
function fn(Socket) {

    router.get('/', (req, res) => {
        const scripts = $scripts.getAssets('global', 'index');
        const styles = $styles.getAssets('global', 'index');

        const opts = { scripts, styles };

        res.render('index', opts);
    });

    router.post('/', (req, res) => {
        const { cookies } = req;
        const { id } = cookies;

        if (!Socket.sendMessage(id, req.body.text))
            return res.redirect('/');

        res.redirect('/');
    });

    router.get('/messages.json', (req, res) => {
        res.json(Socket.getMessages());
    });

    router.get('/data.json', (req, res) => {
        const { cookies } = req;
        const { id } = cookies;

        const data = Socket.rateLimiter.getOrCreate(id);

        if (data)
            return res.json(data.inspect());

        res.json({});
    });

    router.get('/overlay', (req, res) => {
        const scripts = $scripts.getAssets('global', 'overlay');
        const styles = $styles.getAssets('global', 'overlay');

        const opts = { scripts, styles };

        res.render('overlay', opts);
    });

    return router;
}

module.exports = fn;
