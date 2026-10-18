const { randomBytes, timingSafeEqual } = require('node:crypto');

function requireLogin(req, res, next) {
    if (req.session.userLoggedIn === true) return next();
    return res.redirect('/login');
}

function csrfProtection(req, res, next) {
    req.session.csrfToken ||= randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const token = req.body?._csrf;
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrfToken))) {
        return res.status(403).send('Invalid form token. Reload the form and try again.');
    }
    next();
}

// Forms accept scalar strings only; reject MongoDB operators and nested JSON.
function scalarBody(req, res, next) {
    if (req.body && (Array.isArray(req.body) || Object.entries(req.body).some(
        ([key, value]) => key.startsWith('$') || key.includes('.') || typeof value !== 'string'
    ))) return res.status(400).send('Invalid form data.');
    next();
}
module.exports = { requireLogin, csrfProtection, scalarBody };
