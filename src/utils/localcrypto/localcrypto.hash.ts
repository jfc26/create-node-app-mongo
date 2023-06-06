import _ from 'lodash';
import crypto from 'node:crypto';

//* ====================== quickHash ======================
export interface QuickHashOptions {
    algorithm?: string;
    encoding?: crypto.BinaryToTextEncoding;
}

export function quickHash(value: string | string[], options: QuickHashOptions = {}): string {
    const { algorithm, encoding } = _.defaults(options, {
        algorithm: 'sha256',
        encoding: 'hex',
    } as QuickHashOptions) as Required<QuickHashOptions>;

    const hashObject = crypto.createHash(algorithm);

    if (Array.isArray(value)) {
        for (const item of value) {
            hashObject.update(item);
        }
    } else {
        hashObject.update(value);
    }

    const result = hashObject.digest(encoding);

    // clean
    hashObject.destroy();
    return result;
}

//* ====================== hashPassword ======================

export function hashPassword(value: string): string {
    const { SECRET_PASSWORD_KEY } = __env;
    const hashObject = crypto.createHash('sha256');

    hashObject.update(SECRET_PASSWORD_KEY);
    hashObject.update(value);
    hashObject.update(SECRET_PASSWORD_KEY);
    hashObject.update(value);

    const result = hashObject.digest('hex');

    // clean
    hashObject.destroy();
    return result;
}
