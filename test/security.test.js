const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcrypt');
const { createHash } = require('node:crypto');
const { createApp } = require('../app');
const Admin = require('../models/adminModel');
const Otp = require('../models/otpModel');
const mailer = require('nodemailer');
const { mock } = require('node:test');
const app = () => createApp({ secret: 'test-only-secret-with-at-least-32-characters' });
const token = response => response.text.match(/name="_csrf" value="([a-f0-9]+)"/)[1];
afterEach(() => mock.restoreAll());

test('all business mutations reject anonymous requests even with a valid CSRF token', async () => {
    const agent = request.agent(app());
    const csrf = token(await agent.get('/login').expect(200));
    for (const path of ['/addEmployee', '/edit/123', '/delete/123', '/inventory/addInventory', '/inventory/edit/123', '/inventory/delete/123', '/schedule/addSchedule', '/schedule/edit/123', '/schedule/delete/123', '/attendance/addAttendance', '/attendance/edit/123', '/attendance/delete/123', '/paystub/generatePaystub']) {
        const response = await agent.post(path).type('form').send({ _csrf: csrf }).expect(302);
        assert.equal(response.headers.location, '/login');
    }
});
test('CSRF rejects missing, forged, cross-session and multibyte tokens', async () => {
    const agent = request.agent(app());
    const csrf = token(await agent.get('/login'));
    for (const value of ['', 'a'.repeat(64), 'é'.repeat(64)]) {
        await agent.post('/login').type('form').send({ _csrf: value }).expect(403);
    }
    await request(app()).post('/login').type('form').send({ _csrf: csrf }).expect(403);
});
test('nested MongoDB operators and arrays are rejected before queries', async () => {
    const query = mock.method(Admin, 'findOne', () => { throw new Error('must not query'); });
    for (const username of [{ $ne: null }, ['admin']]) {
        await request(app()).post('/login').send({ username, password: 'password' }).expect(400);
    }
    assert.equal(query.mock.callCount(), 0);
});
test('public administrator registration is disabled', async () => {
    const agent = request.agent(app());
    const csrf = token(await agent.get('/login'));
    await agent.post('/signup').type('form').send({ _csrf: csrf }).expect(403);
    await agent.get('/signup').expect(403);
});
test('login rotates the session and protects authenticated mutations against CSRF', async () => {
    mock.method(Admin, 'findOne', async () => ({ username: 'admin', password: await bcrypt.hash('test-password-123', 4) }));
    const agent = request.agent(app());
    const before = await agent.get('/login');
    const login = await agent.post('/login').type('form').send({ _csrf: token(before), username: 'admin', password: 'test-password-123' }).expect(302);
    assert.notEqual(login.headers['set-cookie'][0].split(';')[0], before.headers['set-cookie'][0].split(';')[0]);
    assert.match(login.headers['set-cookie'][0], /HttpOnly/);
    assert.match(login.headers['set-cookie'][0], /SameSite=Lax/);
    await agent.post('/addEmployee').type('form').send({ _csrf: token(before) }).expect(403);
    await agent.get('/delete/123').expect(404);
    await agent.get('/logout').expect(404);
});
test('reset codes are hashed, scoped, expiring and consumed once', async () => {
    let saved, code, consumed = false;
    mock.method(Admin, 'findOne', async () => ({ mail: 'admin@example.com' }));
    mock.method(Otp, 'deleteMany', async () => ({}));
    mock.method(Otp, 'create', async value => { saved = { ...value, _id: 'test-id' }; });
    mock.method(mailer, 'createTransport', () => ({ sendMail: async value => { code = value.text.match(/\d{6}/)[0]; } }));
    mock.method(Otp, 'findOneAndUpdate', async filter => {
        assert.equal(filter.challenge, saved.challenge);
        assert.ok(filter.expiresAt.$gt instanceof Date);
        assert.equal(filter.attempts.$lt, 5);
        return consumed ? null : saved;
    });
    mock.method(Otp, 'findOneAndDelete', async filter => {
        assert.equal(filter._id, saved._id);
        assert.equal(filter.codeHash, saved.codeHash);
        assert.ok(filter.expiresAt.$gt instanceof Date);
        if (consumed) return null;
        consumed = true;
        return saved;
    });
    const update = mock.method(Admin, 'updateOne', async (filter, change) => {
        assert.equal(filter.mail, saved.mail);
        assert.ok(await bcrypt.compare('new-password-123', change.$set.password));
    });
    const agent = request.agent(app());
    let csrf = token(await agent.get('/verifyEmail'));
    await agent.post('/verifyEmail').type('form').send({ _csrf: csrf, yourEmail: 'admin@example.com' }).expect(200);
    assert.equal(saved.codeHash, createHash('sha256').update(code).digest('hex'));
    assert.ok(saved.expiresAt > new Date());
    assert.ok(saved.expiresAt <= new Date(Date.now() + 300000));
    const other = request.agent(app());
    const otherCsrf = token(await other.get('/verifyEmail'));
    await other.post('/resetPssword').type('form').send({ _csrf: otherCsrf, otp: code, resetPassword: 'new-password-123' }).expect(400);
    await agent.post('/resetPssword').type('form').send({ _csrf: csrf, otp: code, resetPassword: 'new-password-123' }).expect(302);
    csrf = token(await agent.get('/login'));
    await agent.post('/resetPssword').type('form').send({ _csrf: csrf, otp: code, resetPassword: 'new-password-123' }).expect(400);
    assert.equal(update.mock.callCount(), 1);
});
test('OTP schema enforces expiry and does not persist plaintext codes', () => {
    assert.equal(Otp.schema.path('expiresAt').options.expires, 0);
    assert.equal(Otp.schema.path('code'), undefined);
});
test('expired or exhausted reset challenges cannot update passwords', async () => {
    mock.method(Admin, 'findOne', async () => null);
    const update = mock.method(Admin, 'updateOne', async () => { throw new Error('must not update'); });
    mock.method(Otp, 'findOneAndUpdate', async filter => {
        assert.ok(filter.expiresAt.$gt instanceof Date);
        assert.equal(filter.attempts.$lt, 5);
        return null;
    });
    const agent = request.agent(app());
    const csrf = token(await agent.get('/verifyEmail'));
    await agent.post('/verifyEmail').type('form').send({ _csrf: csrf, yourEmail: 'absent@example.com' }).expect(200);
    await agent.post('/resetPssword').type('form').send({ _csrf: csrf, otp: '123456', resetPassword: 'new-password-123' }).expect(400);
    assert.equal(update.mock.callCount(), 0);
});
test('repeated authentication attempts are throttled', async () => {
    const agent = request.agent(app());
    const csrf = token(await agent.get('/login'));
    let response;
    for (let i = 0; i < 11; i++) response = await agent.post('/login').type('form').send({ _csrf: csrf });
    assert.equal(response.status, 429);
});
