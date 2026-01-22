import { Schema } from 'mongoose';
import { GenerationStatus } from 'src/libs/enums/AIGenerations.enum';


const AIGenerationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GenerationStatus),
      default: GenerationStatus.PENDING,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    generatedImages: {
      type: [String],
      default: [],
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default AIGenerationSchema;
