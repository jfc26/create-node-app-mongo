import * as log from 'loglevel';
import { User } from './User';

const isUsernameExisted = async (username: string): Promise<Boolean> => {
    try {
        const userFound = await User.findOne(
            {
                username,
            },
            { _id: 1 },
        );

        return userFound != null;
    } catch (e) {
        log.error(e);
        return false;
    }
};

export const userStatics = {
    isUsernameExisted,
};

export type UserStaticsType = typeof userStatics;
