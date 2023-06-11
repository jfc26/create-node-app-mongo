import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import SignInRecord from '../../database/SignInRecord';
import { basicDecode } from './localcrypto.cipher';
import _ from 'lodash';

const JWT_ALGORITHM = 'HS512';
const TWO_FACTOR_SECRET_ENCODING: speakeasy.Encoding = 'base32';
const TWO_FACTOR_SECRET_LENGTH: number = 32;

export function getTokenExpireTime(token: string): Date {
    const { exp } = jwt.decode(token) as JwtDecodePayload;
    return new Date(exp * 1000);
}

export function createAccessToken(payload: AccessToken): string {
    const { SECRET_ACCESS_TOKEN_KEY, ACCESS_TOKEN_EXPIRE_IN } = __env;

    const token = jwt.sign(payload, SECRET_ACCESS_TOKEN_KEY, {
        algorithm: JWT_ALGORITHM,
        expiresIn: ACCESS_TOKEN_EXPIRE_IN,
    });
    return token;
}

export function createRefreshToken(payload: RefreshToken): string {
    const { SECRET_REFRESH_TOKEN_KEY, REFRESH_TOKEN_EXPIRE_IN } = __env;

    const token = jwt.sign(payload, SECRET_REFRESH_TOKEN_KEY, {
        algorithm: JWT_ALGORITHM,
        expiresIn: REFRESH_TOKEN_EXPIRE_IN,
    });
    return token;
}

export async function verifyAccessToken(token: string): Promise<AccessToken | undefined> {
    try {
        if (typeof token !== 'string') {
            return undefined;
        }

        const payload = jwt.verify(token, __env.SECRET_ACCESS_TOKEN_KEY) as AccessToken;
        return payload;
    } catch (e) {
        return undefined;
    }
}

export async function verifyRefreshToken(token: string): Promise<RefreshToken | undefined> {
    try {
        if (typeof token !== 'string') {
            return undefined;
        }

        // verify token
        const payload = jwt.verify(token, __env.SECRET_REFRESH_TOKEN_KEY) as RefreshToken;
        const { _id, userId } = payload;

        // verify from database
        const signInRecord = await SignInRecord.findOne({
            _id: new ObjectId(_id),
            isSignedOut: false,
            owner: new ObjectId(userId),
            refreshToken: token,
            refreshTokenExpireAt: {
                $gt: new Date(),
            },
        });

        if (signInRecord == null) {
            return undefined;
        }

        return payload;
    } catch (e) {
        return undefined;
    }
}

export function verifyTwoFactorToken(secretEncrypted: string, token: string): boolean {
    if ((secretEncrypted.length !== 0 && token.length === 0) || (secretEncrypted.length === 0 && token.length !== 0)) {
        return false;
    }

    if (secretEncrypted.length === 0 && token.length === 0) return true;

    return speakeasy.totp.verify({
        secret: basicDecode(secretEncrypted),
        encoding: TWO_FACTOR_SECRET_ENCODING,
        token,
    });
}

//* generateTwoFactorSecret

interface GenerateTwoFactorSecretOptions {
    /**
     * @default env.APP_NAME
     */
    appName?: string;

    /**
     * @default 'username'
     */
    username?: string;
}

/**
 * Return base32 random secret
 */
export function generateTwoFactorSecret(options: GenerateTwoFactorSecretOptions) {
    const { appName, username } = _.defaults(options, {
        appName: __env.APP_NAME,
        username: 'username',
    } as GenerateTwoFactorSecretOptions) as Required<GenerateTwoFactorSecretOptions>;

    const { base32 } = speakeasy.generateSecret({
        name: `${appName}: ${username}`,
        length: TWO_FACTOR_SECRET_LENGTH,
    });

    return base32;
}
