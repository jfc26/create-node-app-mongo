import { Types } from 'mongoose';

export async function loadGlobalVariables() {
    (global as any).ObjectId = Types.ObjectId;
}
