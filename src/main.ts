import express from 'express';
import cookieParser from 'cookie-parser';
import * as log from 'loglevel';

log.setLevel('trace');

//! global database plugin import
import './plugin/basic-info-plugin';
import './plugin/soft-delete-plugin';
//!

import loader from './loader';
import createControllerRouter from './controllers';

const main = async () => {
    // ! Requires first loaded
    await loader.loadGlobalVariables();
    await loader.loadEnvironment();
    await loader.connectToDatabase();
    await loader.loadRootAccount();

    const controllerRouter = await createControllerRouter();
    const app = express();

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use(cookieParser());

    app.use(controllerRouter);

    app.listen(__env.PORT, () => {
        console.log(`App running on port ${__env.PORT}`);
    });
};

main();
