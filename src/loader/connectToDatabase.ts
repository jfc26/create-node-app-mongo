import mongoose from 'mongoose';
import * as log from 'loglevel';

function createConnectionString() {
    const connectionUrl = new URL('mongodb://');
    connectionUrl.host = __env.DB_HOST;
    connectionUrl.port = __env.DB_PORT.toString();

    if (__env.DB_USERNAME) connectionUrl.username = __env.DB_USERNAME;
    if (__env.DB_PASSWORD) connectionUrl.password = __env.DB_PASSWORD;

    const connectionString = connectionUrl.toJSON();

    log.trace('database connection string: ', connectionString);

    return connectionString;
}

export async function connectToDatabase() {
    await mongoose.connect(createConnectionString(), {
        dbName: __env.DB_DATABASE_NAME,
        directConnection: true,
        authMechanism: 'DEFAULT',
    });

    if (mongoose.connection.readyState !== 1) {
        throw new Error('Connect to database failed');
    }

    log.info('Connect to database success');
}
