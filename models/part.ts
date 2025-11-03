import mongoose, { model, Schema } from "mongoose";

export interface Detail {
  name: string;
  data: string;
}

export interface IPart {
  siyam_ref: string;
  radiator_type: string;
  make: string;
  model: string;
  oem: string[];
  category: string;
  details: Detail[];
  image_url: string;
  image_key: string;
  amazon_url: string;
}

const PartSchema = new Schema<IPart>({
  siyam_ref: String,
  radiator_type: String,
  make: String,
  model: String,
  oem: [{ type: String }],
  category: String,
  details: [{ name: String, data: String }],
  image_url: String,
  image_key: String,
  amazon_url: String,
});

export const Part = mongoose.models.Part || model<IPart>("Part", PartSchema);
