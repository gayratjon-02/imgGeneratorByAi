import { Schema } from 'mongoose';
import { MemberRole } from '../libs/enums/roles.enum';

const MemberSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.USER,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default MemberSchema;
