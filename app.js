const express = require('express');
const session = require('express-session');
const path = require('node:path');
const { requireLogin, csrfProtection, scalarBody } = require('./middleware/security');

function createApp({ secret, store, production = false } = {}) {
    if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
    const app = express();
    app.disable('x-powered-by');
    // Set only when the deployment is behind exactly one trusted reverse proxy.
    if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: false, limit: '16kb' }));
    app.use(express.json({ limit: '16kb' }));
    app.use(scalarBody);
    app.use(session({ secret, store, resave: false, saveUninitialized: false,
        cookie: { maxAge: 1800000, httpOnly: true, sameSite: 'lax', secure: production } }));
    app.use(require('connect-flash')());
    app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
    app.use(csrfProtection);
    app.use('/', require('./routes/loginRouter'));
    // All business routers, including every POST and future route, require login.
    app.use(requireLogin);
    app.use('/', require('./routes/mainRouter'));
    app.use('/inventory', require('./routes/inventoryRouter'));
    app.use('/schedule', require('./routes/scheduleRouter'));
    app.use('/attendance', require('./routes/attendanceRouter'));
    app.use('/paystub', require('./routes/paystubRouter'));
    app.use((err, req, res, next) => {
        if (res.headersSent) return next(err);
        res.status(err.status === 400 || err.status === 413 ? err.status : 500).send('Unable to process request.');
    });
    return app;
}
module.exports = { createApp };
