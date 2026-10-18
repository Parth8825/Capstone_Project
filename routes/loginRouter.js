const express = require('express');
const bcrypt = require('bcrypt');
const { randomInt, randomBytes, createHash } = require('node:crypto');
const { rateLimit } = require('express-rate-limit');
const Admin = require('../models/adminModel');
const Otp = require('../models/otpModel');
const router = express.Router();
const hash = value => createHash('sha256').update(value).digest('hex');
const validPassword = value => typeof value === 'string' && value.length >= 12 && Buffer.byteLength(value) <= 72;
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const regenerate = req => new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
const saveSession = req => new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));

router.get('/login', (req, res) => req.session.userLoggedIn ? res.redirect('/') : res.render('login'));
// Administrators have access to all employee records. Provision them out of band.
router.all('/signup', (req, res) => res.status(403).send('Contact your administrator for an account.'));
router.post('/login', limiter, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (typeof username !== 'string' || typeof password !== 'string' || !username || Buffer.byteLength(password) > 72) {
            return res.status(400).render('login', { loginError: 'Invalid username or password.' });
        }
        const admin = await Admin.findOne({ username });
        // Compare a dummy hash as well to avoid a fast path for unknown usernames.
        const matches = await bcrypt.compare(password, admin ? admin.password : '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
        if (!admin || !matches) return res.status(401).render('login', { loginError: 'Invalid username or password.' });
        await regenerate(req);
        req.session.username = admin.username;
        req.session.userLoggedIn = true;
        await saveSession(req);
        res.redirect('/');
    } catch (err) { next(err); }
});
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});
router.get('/verifyEmail', (req, res) => res.render('changePassword/verifyEmail'));
router.post('/verifyEmail', limiter, async (req, res, next) => {
    try {
        const email = req.body.yourEmail;
        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return res.status(400).render('changePassword/verifyEmail', { error: 'Enter a valid email address.' });
        }
        // Every request gets an opaque challenge, including unknown addresses.
        const challenge = randomBytes(32).toString('hex');
        req.session.resetChallenge = challenge;
        const admin = await Admin.findOne({ mail: email });
        if (admin) {
            const code = String(randomInt(100000, 1000000));
            await Otp.deleteMany({ mail: email });
            await Otp.create({ mail: email, challenge, codeHash: hash(code), expiresAt: new Date(Date.now() + 300000), attempts: 0 });
            const transporter = require('nodemailer').createTransport({
                service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({ from: process.env.EMAIL_USER, to: email,
                subject: 'Password reset code', text: `Your code is ${code}. It expires in 5 minutes.` });
        }
        await saveSession(req);
        res.render('changePassword/resetPassword');
    } catch (err) { next(err); }
});
router.post('/resetPssword', limiter, async (req, res, next) => {
    try {
        const { otp, resetPassword } = req.body;
        const invalid = () => res.status(400).render('changePassword/resetPassword', { error: 'Invalid or expired code, or password must be at least 12 characters and at most 72 bytes.' });
        if (!req.session.resetChallenge || typeof otp !== 'string' || !/^\d{6}$/.test(otp) || !validPassword(resetPassword)) return invalid();
        // Increment attempts atomically; concurrent requests cannot bypass the limit.
        const challenge = req.session.resetChallenge;
        const attempt = await Otp.findOneAndUpdate({ challenge, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } });
        if (!attempt || attempt.codeHash !== hash(otp)) return invalid();
        const password = await bcrypt.hash(resetPassword, 12);
        // Atomic consumption ensures only one request can use a valid code.
        const consumed = await Otp.findOneAndDelete({ _id: attempt._id, codeHash: hash(otp), expiresAt: { $gt: new Date() } });
        if (!consumed) return invalid();
        await Admin.updateOne({ mail: consumed.mail }, { $set: { password } });
        await regenerate(req);
        await saveSession(req);
        res.redirect('/login');
    } catch (err) { next(err); }
});
module.exports = router;
