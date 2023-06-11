import { Model, Schema } from 'mongoose';
import { createCollection } from '../../utils/dbutils';

export interface SignInRecordSchema extends BasicCollection {
    ipAddress: string;
    userAgent: string;
    isSignedOut: boolean;

    accessToken: string;
    accessTokenExpireAt: Date;

    refreshToken: string;
    refreshTokenExpireAt: Date;
}

interface SignInRecordModel extends Model<SignInRecordSchema>, BasicModel {}

export type SignInRecordDocument = BasicDocument<SignInRecordSchema>;

export const SignInRecord = createCollection<SignInRecordSchema, SignInRecordModel>({
    name: 'SignInRecord',
    schema: new Schema<SignInRecordSchema>(
        {
            ipAddress: {
                type: String,
            },
            userAgent: {
                type: String,
            },
            isSignedOut: {
                type: Boolean,
                require: true,
            },
            accessToken: {
                type: String,
                required: true,
            },
            accessTokenExpireAt: {
                type: Date,
                required: true,
            },
            refreshToken: {
                type: String,
                required: true,
            },
            refreshTokenExpireAt: {
                type: Date,
                required: true,
            },
        },
        { timestamps: true },
    ),
});
