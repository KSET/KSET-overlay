const express = require('express');
const router = express.Router();
const { scripts: $scripts, styles: $styles } = require('../lib/assets');

/**
 * @param [Socket] Socket
 */
function fn(Socket) {

    router.get('/', (req, res) => {
        const scripts = $scripts.getAssets('global', 'index');
        const styles = $styles.getAssets('global', 'index');

        const opts = { scripts, styles };

        res.render('index', opts);
    });

    router.get('/messages.json', (req, res) => {
        res.json(Socket.getMessages());
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
