import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ required: true })
  date!: string;

  @Prop()
  diagnosis?: string;

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ patientId: 1 });
VisitSchema.index({ doctorId: 1 });
VisitSchema.index({ date: 1 });
