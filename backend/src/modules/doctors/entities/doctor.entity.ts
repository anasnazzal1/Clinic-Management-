import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  specialization!: string;

  @Prop({ type: Types.ObjectId, ref: 'Clinic', required: true })
  clinicId!: Types.ObjectId;

  @Prop({ required: true })
  workingDays!: string;

  @Prop({ required: true })
  workingHours!: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
DoctorSchema.index({ clinicId: 1 });
DoctorSchema.index({ specialization: 1 });
