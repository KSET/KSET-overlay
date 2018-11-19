const express = require('express');
const router = express.Router();

const Settings = require('../lib/settings');

const { scripts: $scripts, styles: $styles } = require('../lib/assets');

/**
 * @param {Socket} Socket
 */
function fn(Socket) {
    router.use((req, res, next) => {
        if (!req.user)
            return res.redirect('./login');

        next();
    });

    router.get('/', (req, res) => {
        const scripts = $scripts.getAssets('global', 'admin');
        const styles = $styles.getAssets('global', 'admin');

        const messages = Socket.getMessages();
        const settings = Settings.inspect();

        const opts = { scripts, styles, messages, settings };

        res.render('admin', opts);
    });

    return router;
}

module.exports = fn;
