require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
async function main() {
    const { ADMIN_USERNAME: username, ADMIN_EMAIL: mail, ADMIN_PASSWORD: password } = process.env;
    if (!username || !/^[a-zA-Z]+\d*$/.test(username) || !mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ||
        !password || password.length < 12 || Buffer.byteLength(password) > 72) {
        throw new Error('Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters, at most 72 bytes).');
    }
    await mongoose.connect(process.env.MONGO_DATABASE_URL);
    if (await Admin.exists({ $or: [{ username }, { mail }] })) throw new Error('Account already exists.');
    await Admin.create({ username, mail, password: await bcrypt.hash(password, 12) });
    console.log('Administrator created.');
}
main().catch(err => { console.error(err.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
