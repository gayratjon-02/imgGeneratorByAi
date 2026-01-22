import { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    frontImageUrl: {
      type: String,
      required: true,
    },
    backImageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default ProductSchema;
