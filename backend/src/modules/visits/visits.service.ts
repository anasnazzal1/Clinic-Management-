import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit, VisitDocument } from './entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { UserRole } from '../../common/constants/roles.constant';

@Injectable()
export class VisitsService {
  constructor(@InjectModel(Visit.name) private visitModel: Model<VisitDocument>) {}

  async create(createVisitDto: CreateVisitDto): Promise<Visit> {
    const visit = new this.visitModel({
      ...(createVisitDto.appointmentId && {
        appointmentId: new Types.ObjectId(createVisitDto.appointmentId),
      }),
      patientId:           new Types.ObjectId(createVisitDto.patientId),
      doctorId:            new Types.ObjectId(createVisitDto.doctorId),
      date:                createVisitDto.date,
      diagnosis:           createVisitDto.diagnosis,
      treatment:           createVisitDto.treatment,
      notes:               createVisitDto.notes,
      prescription:        createVisitDto.prescription,
      followUpDate:        createVisitDto.followUpDate,
      remarks:             createVisitDto.remarks,
      improvementStatus:   createVisitDto.improvementStatus,
      treatmentDuration:   createVisitDto.treatmentDuration,
      clinicalObservations:createVisitDto.clinicalObservations,
      followUpActions:     createVisitDto.followUpActions,
      caseStatus:          createVisitDto.caseStatus,
      medicalAlerts:       createVisitDto.medicalAlerts,
    });

    return visit.save();
  }

  /**
   * Admin → all visits.
   * Doctor → only their own visits (doctorId filter enforced here).
   */
  async findAll(callerRole?: string, callerLinkedId?: string): Promise<Visit[]> {
    const query: Record<string, unknown> = {};

    if (callerRole === UserRole.DOCTOR) {
      if (!callerLinkedId) throw new ForbiddenException('Doctor identity could not be resolved');
      query.doctorId = new Types.ObjectId(callerLinkedId);
    }

    return this.visitModel
      .find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visitModel
      .findById(id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .exec();
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  async findByAppointment(appointmentId: string): Promise<Visit> {
    const visit = await this.visitModel
      .findOne({ appointmentId: new Types.ObjectId(appointmentId) })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .exec();
    if (!visit) throw new NotFoundException('Visit not found for this appointment');
    return visit;
  }

  /**
   * Returns visits for a patient.
   * Doctor → scoped to their own visits for that patient.
   * Patient → all their own visits (across doctors).
   * Admin → all visits for that patient.
   */
  async findByPatient(
    patientId: string,
    callerRole?: string,
    callerLinkedId?: string,
  ): Promise<Visit[]> {
    const query: Record<string, unknown> = {
      patientId: new Types.ObjectId(patientId),
    };

    if (callerRole === UserRole.DOCTOR && callerLinkedId) {
      query.doctorId = new Types.ObjectId(callerLinkedId);
    }

    return this.visitModel
      .find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Returns visits for a doctor.
   * Doctor → can only fetch their own (enforced).
   * Admin → can fetch any doctor's visits.
   */
  async findByDoctor(
    doctorId: string,
    callerRole?: string,
    callerLinkedId?: string,
  ): Promise<Visit[]> {
    if (callerRole === UserRole.DOCTOR && callerLinkedId !== doctorId) {
      throw new ForbiddenException('Doctors can only access their own visits');
    }

    return this.visitModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .sort({ date: -1 })
      .exec();
  }

  async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    const visit = await this.visitModel.findByIdAndUpdate(
      id,
      {
        ...updateVisitDto,
        patientId: updateVisitDto.patientId ? new Types.ObjectId(updateVisitDto.patientId) : undefined,
        doctorId:  updateVisitDto.doctorId  ? new Types.ObjectId(updateVisitDto.doctorId)  : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.visitModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Visit not found');
    return { message: 'Visit deleted successfully' };
  }
}
