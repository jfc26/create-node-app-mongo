import mongoose, { Schema, Types } from 'mongoose';

const basicInfoPlugin = (schema: Schema) => {
    schema.add({
        createdBy: {
            type: Types.ObjectId,
            required: true,
        },
        owner: {
            type: Types.ObjectId,
            required: true,
        },
    });
};

mongoose.plugin(basicInfoPlugin);
