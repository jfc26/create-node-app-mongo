import { Model, Schema } from 'mongoose';
import { createCollection } from '../../utils/dbutils';

export interface SignInRecordSchema extends BasicCollection {
    ipAddress: string;
    userAgent: string;

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
            ipAddress: String,
            userAgent: String,
            accessToken: String,
            accessTokenExpireAt: Date,
            refreshToken: String,
            refreshTokenExpireAt: String,
        },
        { timestamps: true },
    ),
});
