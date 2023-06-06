import { Model, Schema } from 'mongoose';
import { createCollection } from '../../utils/dbutils';
import g from '../../utils/g';
import { UserStaticsType, userStatics } from './User.statics';

export interface UserSchema extends BasicCollection {
    displayName: string;
    username: string;
    passwordHashed: string;
    twoFactorSecretEncrypted: string;
}

interface UserModel extends Model<UserSchema>, BasicModel, UserStaticsType {}

export type UserDocument = BasicDocument<UserSchema>;

export const User = createCollection<UserSchema, UserModel>({
    name: 'user',
    schema: new Schema<UserSchema>(
        {
            displayName: {
                type: String,
                default: '',
            },
            username: {
                type: String,
                required: true,
                unique: true,
                validate: {
                    validator: g.isUsername,
                },
            },
            passwordHashed: {
                type: String,
                required: true,
            },
            twoFactorSecretEncrypted: {
                type: String,
            },
        },
        { timestamps: true },
    ),
    statics: [userStatics],
});
