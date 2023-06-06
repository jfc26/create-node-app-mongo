import _ from 'lodash';
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { FilterQuery } from 'mongoose';

export type SoftDeletePluginStatics = typeof softDeletePluginStatics;

//==

export interface SoftDeleteProps {
    _id: ObjectId;
    deletedBy: ObjectId;
    owner?: ObjectId;
}
const softDelete = async function <T extends BasicCollection>(
    this: Model<T>,
    props: SoftDeleteProps,
): Promise<mongoose.UpdateWriteOpResult> {
    const { _id, deletedBy, owner } = props;

    const conditions = {
        _id: _id,
        isDeleted: false,
    } as FilterQuery<BasicCollection>;

    if (owner != null) {
        conditions.owner = owner;
    }

    const deletedResult = await this.updateOne(conditions, {
        $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy,
        },
    });

    return deletedResult;
};

const softDeletePluginStatics = {
    softDelete: softDelete,
};

const softDeletePlugin = (schema: Schema) => {
    schema.add({
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        deletedBy: {
            type: Types.ObjectId,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    });

    Object.assign(schema.statics, softDeletePluginStatics);
};

mongoose.plugin(softDeletePlugin);
