import * as log from 'loglevel';
import User from '../database/User';
import authutils from '../utils/authutils';

export async function loadRootAccount() {
    try {
        if (await User.isUsernameExisted(__env.ACCOUNT_ROOT_USERNAME)) {
            log.trace('Root account was created');
            return;
        }

        const rootUser = await authutils.createAccount({
            displayName: 'root',
            owner: __env.SYS_OBJECT_ID,
            createdBy: __env.SYS_OBJECT_ID,
            username: __env.ACCOUNT_ROOT_USERNAME,
            password: __env.ACCOUNT_ROOT_PASSWORD,
            twoFactorSecret: __env.ACCOUNT_ROOT_TWO_FACTOR_SECRET,
        });

        log.info(rootUser.toJSON());
    } catch (e) {
        throw e;
    }
}
