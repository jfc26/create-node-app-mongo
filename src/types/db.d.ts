import { Document, Types } from 'mongoose';
import { SoftDeletePluginStatics } from '../plugin/soft-delete-plugin';

export {};

declare global {
    class ObjectId extends Types.ObjectId {}

    interface BasicCollection {
        _id: ObjectId;

        createdBy: ObjectId;
        owner: ObjectId;

        isDeleted: boolean;
        deletedBy?: ObjectId;
        deletedAt?: Date;

        createdAt: Date;
        updatedAt: Date;
    }

    interface BasicModel extends SoftDeletePluginStatics {}

    type BasicDocument<T extends BasicCollection = BasicCollection> = Document<unknown, {}, T> &
        Omit<
            T &
                Required<{
                    _id: ObjectId;
                }>,
            never
        >;
}
