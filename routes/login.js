const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Settings = require('../lib/settings');
const { scripts: $scripts, styles: $styles } = require('../lib/assets');

/**
 * @param {Socket} Socket
 */
function fn(Socket) {
    router.get('/login', (req, res) => {
        if (req.user)
            return res.redirect('./admin');

        const scripts = $scripts.getAssets('global', 'login');
        const styles = $styles.getAssets('global', 'login');
        const csrf = {};

        const opts = { scripts, styles, csrf };

        res.render('login', opts);
    });

    router.post('/login', (req, res) => {
        const { body } = req;
        const { password } = body;

        const success = password === Settings.password;

        if (!success)
            return res.json({ success });

        jwt.sign({ success }, Settings.secret, { expiresIn: 30 * 60 }, (err, data) => {
            if (err)
                return res.json({ err });

            res.cookie('auth', data);

            if (req.xhr)
                res.json({ success });
            else
                res.redirect('./admin');
        });
    });

    router.get('/logout', (req, res) => {
        res.clearCookie('auth');
        res.redirect('./');
    });

    return router;
}

module.exports = fn;
