import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ required: true })
  date!: string;

  @Prop()
  diagnosis?: string;

  @Prop()
  treatment?: string;

  @Prop()
  notes?: string;

  @Prop()
<<<<<<< HEAD
  prescription?: string;

  @Prop()
  followUpDate?: string;

=======
  followUpDate?: string;

  @Prop()
  remarks?: string;

  // ── Enhanced completion fields ────────────────────────────────────────────

  /** Overall patient improvement status */
  @Prop({
    enum: ['fully_recovered', 'significant_improvement', 'moderate_improvement', 'no_improvement', 'worsened'],
  })
  improvementStatus?: string;

  /** Estimated remaining treatment duration (free text) */
  @Prop()
  treatmentDuration?: string;

  /** Clinical observations: symptom changes, new findings, vitals summary */
  @Prop()
  clinicalObservations?: string;

  /** Required follow-up actions */
  @Prop()
  followUpActions?: string;

  /** Case status */
  @Prop({ enum: ['closed', 'monitoring', 'requires_consultation'] })
  caseStatus?: string;

  /** Medical alerts: allergies, risk factors, urgent referrals */
  @Prop()
  medicalAlerts?: string;

>>>>>>> b325177 (add some update)
  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ appointmentId: 1 });
VisitSchema.index({ patientId: 1 });
VisitSchema.index({ doctorId: 1 });
VisitSchema.index({ date: 1 });
