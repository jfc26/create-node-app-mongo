import z from 'zod';
import g from '../utils/g';
import cvtlib from '../utils/cvtlib';

export function envschema() {
    return z.object({
        APP_NAME: z.string().default('Create Node App Mongo'),
        PORT: z.preprocess(cvtlib.toIntNil, g.port().default(3000).describe('<number>')),
        SYS_OBJECT_ID: g.strObjectId().default('0'.padEnd(24, '0')),
        DEBUG: z.preprocess(cvtlib.stringBoolToBoolNil, z.boolean().default(false).describe('<boolean|undefined>')),

        ACCESS_TOKEN_EXPIRE_IN: z.string().default('24h').describe('<string>'),
        REFRESH_TOKEN_EXPIRE_IN: z.string().default('30 days').describe('<string>'),

        // * SECRET
        SECRET_BASIC_KEY: z
            .string()
            .transform((v) => Buffer.from(v, 'hex'))
            .describe('<string> hex 24 bytes'),
        SECRET_IV: z
            .string()
            .transform((v) => Buffer.from(v, 'hex'))
            .describe('<string> hex 16 bytes'),
        SECRET_PASSWORD_KEY: z.string(),
        SECRET_ACCESS_TOKEN_KEY: z.string(),
        SECRET_REFRESH_TOKEN_KEY: z.string(),

        // * ACCOUNT
        ACCOUNT_ROOT_USERNAME: z.string().default('root'),
        ACCOUNT_ROOT_PASSWORD: z.string().default('root_password'),
        ACCOUNT_ROOT_TWO_FACTOR_SECRET: z.string().default(''),

        // * DATABASE
        DB_PORT: z.preprocess(cvtlib.toIntNil, g.port().default(27017)).describe(`min 1, max ${2 ** 16 - 1}`),
        DB_HOST: z.string().default('127.0.0.1'),
        DB_USERNAME: z.string().optional(),
        DB_PASSWORD: z.string().optional(),
        DB_DATABASE_NAME: z.string().default('SampleNodeAppMongo'),
    });
}

export type EnvType = g.InferFn<typeof envschema>;
