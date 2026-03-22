import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class EmailVerificationToken extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(EmailVerificationToken);
EmailVerificationTokenSchema.index({ token: 1 });
EmailVerificationTokenSchema.index({ userId: 1 });
EmailVerificationTokenSchema.index({ expiresAt: 1 });
