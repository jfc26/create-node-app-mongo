import { describe, test, expect } from 'vitest';
import * as localcrypto from './localcrypto';
import loader from '../../loader';

describe('basic-encode', async () => {
    await loader.loadEnvironment(); // ! Important

    console.log(__env);

    test('basic encode', async () => {
        const originalValue = 'Some contents...';

        const encodeResult = localcrypto.basicEncode(originalValue);
        console.log('encodeResult', encodeResult);

        const decodeResult = localcrypto.basicDecode(encodeResult);
        console.log('decodeResult', decodeResult);

        expect(decodeResult).toBe(originalValue);
    });
});
