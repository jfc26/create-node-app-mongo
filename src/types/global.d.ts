import { EnvType } from '../configs/envschema';

export {};

declare global {
    interface IndexSignature<T = any> {
        [KEY: string]: T;
    }

    type AnyKeys<T> = { [P in keyof T]?: T[P] | any };

    const __env: Readonly<EnvType>;
}
