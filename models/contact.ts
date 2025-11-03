import mongoose, { model, Schema } from "mongoose";

export interface IContact {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  siyam_ref?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    siyam_ref: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Contact =
  mongoose.models.Contact || model<IContact>("Contact", ContactSchema);

