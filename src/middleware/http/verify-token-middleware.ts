import { NextFunction, Request, Response } from 'express';
import * as log from 'loglevel';
import localcrypto from '../../utils/localcrypto';

export async function verifyAccessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { access_token: strAccessToken } = req.cookies;

        const accessToken = await localcrypto.verifyAccessToken(strAccessToken);

        if (!accessToken) {
            res.sendStatus(403).end();
            return;
        }

        req.accessToken = accessToken;
        next();
        return;
    } catch (e) {
        log.error(e);
        res.sendStatus(500).end();
        return;
    }
}

export async function verifyRefreshTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { refresh_token: strRefreshToken } = req.cookies;

        const refreshToken = await localcrypto.verifyRefreshToken(strRefreshToken);

        if (!refreshToken) {
            res.sendStatus(403).end();
            return;
        }

        req.refreshToken = refreshToken;
        next();
        return;
    } catch (e) {
        log.error(e);
        res.sendStatus(500).end();
        return;
    }
}
