const express = require('express');
const router = express.Router();

/**
 * @param [Socket] Socket
 */
function fn(Socket) {

    router.get('/', (req, res) => {
        res.render('index');
    });

    router.get('/messages.json', (req, res) => {
        res.json(Socket.getMessages());
    });

    router.get('/overlay', (req, res) => {
        res.render('overlay');
    });

    return router;
}

module.exports = fn;
