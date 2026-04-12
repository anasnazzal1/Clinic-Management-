import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    createdByPatient: boolean,
  ): Promise<Appointment> {
    const duplicate = await this.appointmentModel
      .findOne({
        doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
        date: createAppointmentDto.date,
        time: createAppointmentDto.time,
        status: { $nin: ['cancelled', 'deleted'] },
      })
      .exec();

    if (duplicate) {
      throw new ConflictException('This time slot is already booked');
    }

    const status = createdByPatient
      ? AppointmentStatus.PENDING_APPROVAL
      : (createAppointmentDto.status ?? AppointmentStatus.PENDING);

    const appointment = new this.appointmentModel({
      patientId: new Types.ObjectId(createAppointmentDto.patientId),
      doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
      clinicId: new Types.ObjectId(createAppointmentDto.clinicId),
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status,
    });

    return appointment.save();
  }

  async findPendingApproval(): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ status: AppointmentStatus.PENDING_APPROVAL })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .populate('clinicId', 'name workingDays workingHours')
      .sort({ date: 1, time: 1 })
      .exec();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .populate('clinicId', 'name workingDays workingHours')
      .exec();
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .populate('clinicId', 'name workingDays workingHours')
      .exec();
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .populate('clinicId', 'name workingDays workingHours')
      .exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization email phone')
      .populate('clinicId', 'name workingDays workingHours')
      .exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const existing = await this.appointmentModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    const nextStatus = updateAppointmentDto.status ?? existing.status;
    const nextDoctorId = updateAppointmentDto.doctorId ?? existing.doctorId.toString();
    const nextDate = updateAppointmentDto.date ?? existing.date;
    const nextTime = updateAppointmentDto.time ?? existing.time;

    if (
      nextStatus === AppointmentStatus.SCHEDULED ||
      nextStatus === AppointmentStatus.PENDING
    ) {
      const dup = await this.appointmentModel
        .findOne({
          _id: { $ne: new Types.ObjectId(id) },
          doctorId: new Types.ObjectId(nextDoctorId),
          date: nextDate,
          time: nextTime,
          status: { $nin: ['cancelled', 'deleted'] },
        })
        .exec();
      if (dup) {
        throw new ConflictException('This time slot is already booked');
      }
    }

    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        ...updateAppointmentDto,
        patientId: updateAppointmentDto.patientId ? new Types.ObjectId(updateAppointmentDto.patientId) : undefined,
        doctorId: updateAppointmentDto.doctorId ? new Types.ObjectId(updateAppointmentDto.doctorId) : undefined,
        clinicId: updateAppointmentDto.clinicId ? new Types.ObjectId(updateAppointmentDto.clinicId) : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.appointmentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Appointment not found');
    }
    return { message: 'Appointment deleted successfully' };
  }
}
