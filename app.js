const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const randomGenerator = require('password-generator');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: false });
const Socket = new (require('./lib/Socket'))(io);
const Settings = require('./lib/settings');

app.set('settings', Settings);

// view engine setup
app.set('views', path.resolve(__dirname, 'views'));
require('ejs');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use((req, res, next) => {
    const { cookies } = req;
    const { id } = cookies;

    if (id)
        return next();

    const newID = randomGenerator(64);
    res.cookie('id', newID);
    req.cookies.id = newID;

    next();
});
app.use(
    require('express-jwt')(
        {
            secret: Settings.secret,
            credentialsRequired: false,
            getToken(req) {
                const { headers, query, cookies } = req;

                if (headers.authorization && headers.authorization.split(' ')[ 0 ] === 'Bearer')
                    return headers.authorization.split(' ')[ 1 ];

                if (query && query.token)
                    return query.token;

                if (cookies && cookies.auth)
                    return cookies.auth;

                return null;
            },
        },
    ),
);
app.use((err, req, res, next) => {
    if (err.name !== 'UnauthorizedError')
        return next();

    res.clearCookie('auth');
    delete req.cookies.auth;

    next();
});


const { scripts, styles, images } = require('./lib/assets');

app.locals = {
    $_styles: styles,
    $_scripts: scripts,
    $_images: images,
    $_settings: Settings,
    rmWhitespace: true,
};

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');

app.use('/', indexRouter(Socket));
app.use('/', loginRouter(Socket));

app.get('/favicon.ico', (req, res) => {
    res.status(404);
    res.end();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const debug = require('debug')('obs-overlay:server');

/**
 * Get port from environment and store in Express.
 */

app.set('host', Settings.host);
app.set('port', Settings.port);

server.listen(app.set('port'), app.set('host'));
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const port = app.set('port');
    const bind = typeof port === 'string'
                 ? 'Pipe ' + port
                 : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
                 ? 'pipe ' + addr
                 : 'port ' + addr.port;

    console.log(`Started server on ${Settings.defaultUrl}`);
    console.log(`Admin password: ${Settings.password}`);

    debug('Listening on ' + bind);
}
