import { Request, Response } from 'express';
import { z } from 'zod';
import * as log from 'loglevel';
import g from '../../utils/g';
import { createRequestValidatorMiddleware } from '../../utils/httputils/httputils';
import authutils, { ReplaceTokenReturn } from '../../utils/authutils';

function signInBodyType() {
    return z
        .object({
            username: g.username(),
            password: g.password(),
            twoFactorToken: g.stringInt('Invalid two-factor authentication token'),
            remember: z.boolean().default(false),
        })
        .strict();
}

type SignInBodyType = g.InferFn<typeof signInBodyType>;

export class AuthController {
    private static _instance: AuthController | undefined = undefined;

    protected constructor() {}

    public static async instance(): Promise<AuthController> {
        if (this._instance == null) {
            this._instance = new AuthController();
        }
        return this._instance;
    }

    public readonly signInValidatorMiddleware = createRequestValidatorMiddleware({
        body: [signInBodyType],
    });

    public readonly signInRoute = async (req: Request, res: Response) => {
        try {
            const { username, password, twoFactorToken } = req.body as SignInBodyType;
            const userId = await authutils.signIn({
                username,
                password,
                twoFactorToken,
            });

            if (!userId) {
                res.sendStatus(403).end();
                return;
            }

            log.trace('[signInRoute] login success');

            const replaceTokenReturn = await authutils.replaceToken({
                userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || '',
            });
            this.setTokenCookies(res, replaceTokenReturn);

            res.status(200).json(replaceTokenReturn).end();
            return;
        } catch (e) {
            log.error(req.path, '\n', e);
            res.sendStatus(500).end();
            return;
        }
    };

    public readonly signOutRoute = async (req: Request, res: Response) => {
        try {
            const success = await authutils.signOut(req.refreshToken);

            if (success) {
                this.clearTokenCookies(res);
            }

            res.status(200)
                .json({
                    success,
                })
                .end();
            return;
        } catch (e) {
            log.error(e);
            res.sendStatus(500).end();
            return;
        }
    };

    private clearTokenCookies(res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }

    private setTokenCookies(res: Response, replaceTokenReturn: ReplaceTokenReturn) {
        res.cookie('access_token', replaceTokenReturn.accessToken, {
            httpOnly: true,
            expires: replaceTokenReturn.accessTokenExpireAt,
        });

        res.cookie('refresh_token', replaceTokenReturn.refreshToken, {
            httpOnly: true,
            expires: replaceTokenReturn.refreshTokenExpireAt,
        });
    }
}
