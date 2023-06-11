import * as log from 'loglevel';
import SignInRecord from '../../database/SignInRecord';
import User, { UserDocument, UserSchema } from '../../database/User';
import localcrypto from '../localcrypto';

async function createAccessTokenPayload(userId: string): Promise<AccessToken> {
    return {
        userId,
    };
}

async function createRefreshTokenPayload(userId: string, _id: string): Promise<RefreshToken> {
    return {
        _id: _id,
        userId,
    };
}

export interface SignInProps {
    username: string;
    password: string;
    twoFactorToken: string;
}

export type SignInReturn = {
    userId: string;
    accessToken: string;
    accessTokenExpireAt: Date;
    refreshToken: string;
    refreshTokenExpireAt: Date;
};

/**
 * if sign-in succeeded then return userId else return undefined
 * @param props
 * @returns userId
 */
export const signIn = async (props: SignInProps): Promise<string | undefined> => {
    const { username, password, twoFactorToken } = props;

    log.trace('signInProps', props);

    //* Check username
    log.trace('Checking username...');

    const user = await User.findOne(
        {
            username: username,
        },
        { twoFactorSecretEncrypted: 1, _id: 1, passwordHashed: 1 },
    );

    //! Not correct username
    if (!user) return undefined;

    //* Check password
    log.trace('Checking password...');

    const { twoFactorSecretEncrypted, passwordHashed, _id } = user;

    //! Not correct password
    if (passwordHashed !== localcrypto.hashPassword(password)) {
        return undefined;
    }

    //* Check two-factor token
    log.trace('Checking two-factor token...');

    //! Invalid token
    if (
        (twoFactorSecretEncrypted.length !== 0 && twoFactorToken.length === 0) ||
        (twoFactorSecretEncrypted.length === 0 && twoFactorToken.length !== 0)
    ) {
        return undefined;
    }

    //* Check two-factor token
    log.trace('Verify two-factor token...');

    //! Verify two-factor token failed
    if (!localcrypto.verifyTwoFactorToken(twoFactorSecretEncrypted, twoFactorToken)) {
        return undefined;
    }

    //! Final
    return _id.toJSON();
};

// ===================== signOut =========================

export const signOut = async (props: RefreshToken): Promise<boolean> => {
    const { _id, userId } = props;
    const updateResult = await SignInRecord.updateOne(
        {
            _id: new ObjectId(_id),
            owner: new ObjectId(userId),
        },
        {
            $set: {
                refreshTokenExpireAt: new Date(),
                isSignedOut: true,
            },
        },
    );

    return updateResult.modifiedCount === 1;
};

// ===================== signUp =========================

export type SignUpProps = Pick<UserSchema, 'username' | 'displayName'> & {
    _id?: string | ObjectId | undefined;
    password: string;
    owner: string | ObjectId;
    createdBy: string | ObjectId;
    twoFactorSecret?: string;
};

export const createAccount = async (props: SignUpProps): Promise<UserDocument> => {
    const { username, password, twoFactorSecret, displayName, _id, owner, createdBy } = props;
    log.trace('createAccount props', props);

    const newAccount = await User.create({
        _id: new ObjectId(_id),
        username,
        displayName,
        owner: new ObjectId(owner),
        createdBy: new ObjectId(createdBy),
        passwordHashed: localcrypto.hashPassword(password),
        twoFactorSecretEncrypted: twoFactorSecret ? localcrypto.basicEncode(twoFactorSecret) : '',
    } as UserSchema);

    log.trace(newAccount);
    return newAccount;
};

export interface ReplaceTokenOptions {
    _id?: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
}

export interface ReplaceTokenReturn {
    _id: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpireAt: Date;
    refreshTokenExpireAt: Date;
}
export async function replaceToken(options: ReplaceTokenOptions): Promise<ReplaceTokenReturn> {
    const { userId, ipAddress, userAgent } = options;
    const signInRecordId = options._id || new ObjectId().toString();

    const accessTokenPayload = await createAccessTokenPayload(userId);
    const refreshTokenPayload = await createRefreshTokenPayload(userId, signInRecordId);

    const accessToken = localcrypto.createAccessToken(accessTokenPayload);
    const refreshToken = localcrypto.createRefreshToken(refreshTokenPayload);

    const accessTokenExpireAt = localcrypto.getTokenExpireTime(accessToken);
    const refreshTokenExpireAt = localcrypto.getTokenExpireTime(refreshToken);

    //* Update or create sign-in record
    if (options._id == null) {
        await SignInRecord.create({
            _id: new ObjectId(signInRecordId),
            owner: new ObjectId(userId),
            createdBy: new ObjectId(userId),
            isSignedOut: false,
            userAgent,
            ipAddress,
            accessToken,
            accessTokenExpireAt,
            refreshToken,
            refreshTokenExpireAt,
        });
    } else {
        const updateResult = await SignInRecord.updateOne(
            {
                _id: new ObjectId(signInRecordId),
            },
            {
                $set: {
                    accessToken,
                    accessTokenExpireAt,
                    refreshToken,
                    refreshTokenExpireAt,
                },
            },
        );

        if (updateResult.modifiedCount !== 1) {
            throw new Error(JSON.stringify(updateResult, null, 4));
        }
    }

    return {
        _id: signInRecordId,
        userId,
        accessToken,
        refreshToken,
        accessTokenExpireAt,
        refreshTokenExpireAt,
    };
}
