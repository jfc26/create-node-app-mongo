import crypto from 'node:crypto';

const INPUT_ENCODING: BufferEncoding = 'utf8';
const OUTPUT_ENCODING: BufferEncoding = 'base64';

export function basicEncode(v: string) {
    const { SECRET_BASIC_KEY, SECRET_IV } = __env;

    const cipher = crypto.createCipheriv('aes-192-cbc', SECRET_BASIC_KEY, SECRET_IV);

    const results: Buffer[] = [];
    results.push(cipher.update(v, INPUT_ENCODING));
    results.push(cipher.final());

    cipher.destroy();
    return Buffer.concat(results).toString(OUTPUT_ENCODING);
}

export function basicDecode(v: string) {
    const { SECRET_BASIC_KEY, SECRET_IV } = __env;

    const decipher = crypto.createDecipheriv('aes-192-cbc', SECRET_BASIC_KEY, SECRET_IV);

    const results: Buffer[] = [];
    results.push(decipher.update(v, OUTPUT_ENCODING));
    results.push(decipher.final());

    return Buffer.concat(results).toString(INPUT_ENCODING);
}
