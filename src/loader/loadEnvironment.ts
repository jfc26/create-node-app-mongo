import path from 'path';
import parseEnv from '../utils/envloader';
import { envschema } from '../configs/envschema';

export async function loadEnvironment() {
    await parseEnv({
        absoluteEnvDir: path.join(__dirname, '../../.env'),
        createIfNotExists: true,
        envschemaFn: envschema,
    }); // ! Important
}
