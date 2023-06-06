import { CompileModelOptions, Schema, model } from 'mongoose';

export function createCollection<T, U, TQueryHelpers = {}>(props: {
    name: string;
    schema: Schema<T, any, any, TQueryHelpers, any, any, any>;
    collection?: string;
    options?: CompileModelOptions;
    statics?: IndexSignature[];
}): U {
    const { name, schema, collection, options, statics } = props;

    if (statics) {
        for (const item of statics) {
            Object.assign(schema.statics, item);
        }
    }

    return model<T, U, TQueryHelpers>(name, schema, collection, options);
}
