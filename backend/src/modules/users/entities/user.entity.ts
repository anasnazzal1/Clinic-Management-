import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  phone!: string;

  @Prop({
    required: true,
    enum: ['admin', 'receptionist', 'doctor', 'patient'],
  })
  role!: string;

  @Prop({ type: String })
  linkedId?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ linkedId: 1 });


