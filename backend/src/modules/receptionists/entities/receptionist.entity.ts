import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReceptionistDocument = Receptionist & Document;

@Schema({ timestamps: true })
export class Receptionist {
  @Prop({ required: true })
  name!: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const ReceptionistSchema = SchemaFactory.createForClass(Receptionist);
ReceptionistSchema.index({ email: 1 });
ReceptionistSchema.index({ name: 1 });
