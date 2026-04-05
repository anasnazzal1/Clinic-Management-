import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name!: string;

  @Prop()
  age?: number;

  @Prop()
  gender?: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  address?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ email: 1 });
