import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClinicDocument = Clinic & Document;

@Schema({ timestamps: true })
export class Clinic {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  workingDays!: string;

  @Prop({ required: true })
  workingHours!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
ClinicSchema.index({ name: 1 });
