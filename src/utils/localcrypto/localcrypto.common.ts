import crypto from 'node:crypto';

export function randomBytes(size: number = 16, encoding: BufferEncoding = 'hex') {
    return crypto.randomBytes(size).toString(encoding);
}
