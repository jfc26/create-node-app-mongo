import * as log from 'loglevel';
import SignInRecord from '../../database/SignInRecord';
import User, { UserDocument, UserSchema } from '../../database/User';
import localcrypto from '../localcrypto';

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
                refreshTokenExpireAt: new Date(Date.now() - 1000),
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

//*
// export interface ReplaceTokenOptions {
//     _id?: string;
//     userId: string;
//     oldRefreshToken?: string;
// }
// export type ReplaceTokenReturn = Awaited<ReturnType<typeof replaceToken>>;
// export async function replaceToken(options: ReplaceTokenOptions) {
//     const oldRefreshToken = options.oldRefreshToken;
//     const signInRecordId = new ObjectId(options._id);
//     const userInfo = await User.getUserInfo({
//         userId: options.userId,
//     });

//     if (!userInfo) {
//         throw new Error('[replaceToken] userInfo == null');
//     }

//     const accessToken = localcrypto.createAccessToken(userInfo);
//     const refreshToken = localcrypto.createRefreshToken({
//         _id: signInRecordId.toJSON(),
//         userId: userInfo.userId,
//     });
//     const accessTokenExpireAt = localcrypto.getTokenExpireTime(accessToken);
//     const refreshTokenExpireAt = localcrypto.getTokenExpireTime(refreshToken);

//     //* Update or create sign-in record
//     if (options._id == null) {
//         await SignInRecord.create({
//             _id: signInRecordId,
//             owner: new ObjectId(userInfo.userId),
//             refreshToken,
//             accessTokenExpireAt,
//             refreshTokenExpireAt,
//         });
//     } else {
//         if (!oldRefreshToken) {
//             throw new Error('oldRefreshToken required if the _id is not null');
//         }

//         const updateResult = await SignInRecord.updateOne(
//             {
//                 _id: signInRecordId,
//                 owner: new ObjectId(userInfo.userId),
//                 refreshToken: oldRefreshToken,
//                 refreshTokenExpireAt: {
//                     $gt: new Date(),
//                 },
//             },
//             {
//                 $set: {
//                     refreshToken,
//                     accessTokenExpireAt,
//                     refreshTokenExpireAt,
//                 },
//             },
//         );

//         if (updateResult.modifiedCount !== 1) {
//             throw new Error(JSON.stringify(updateResult, null, 4));
//         }
//     }

//     return {
//         accessToken,
//         refreshToken,
//         accessTokenExpireAt,
//         refreshTokenExpireAt,
//         ...userInfo,
//     };
// }
