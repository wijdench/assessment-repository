import { Schema, Document } from 'mongoose';

export const MakeSchema = new Schema({
  makeId: String,
  makeName: String,
  vehicleTypes: [{ typeId: String, typeName: String }],
});

export interface Make extends Document {
  makeId: string;
  makeName: string;
  vehicleTypes: {
    typeId: string;
    typeName: string;
  }[];
}
