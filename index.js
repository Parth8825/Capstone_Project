require('dotenv').config();
const mongoose = require('mongoose');
const { createApp } = require('./app');
async function start() {
    const production = process.env.NODE_ENV === 'production';
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) throw new Error('Set SESSION_SECRET to a random value of at least 32 characters.');
    await mongoose.connect(process.env.MONGO_DATABASE_URL);
    const MongoStore = require('connect-mongo');
    const store = MongoStore.create({ client: mongoose.connection.getClient() });
    const app = createApp({ secret, store, production });
    app.listen(process.env.PORT || 8080);
}
start().catch(() => { console.error('Startup failed. Check database and session configuration.'); process.exitCode = 1; });
