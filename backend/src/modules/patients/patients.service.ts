import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/constants/roles.constant';
import { Appointment, AppointmentDocument } from '../appointments/entities/appointment.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private usersService: UsersService,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existingPatient = await this.patientModel.findOne({
      email: createPatientDto.email.toLowerCase(),
    });

    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists');
    }

    const patient = new this.patientModel({
      name: createPatientDto.name,
      age: createPatientDto.age,
      gender: createPatientDto.gender,
      phone: createPatientDto.phone,
      email: createPatientDto.email.toLowerCase(),
      address: createPatientDto.address,
    });

    const savedPatient = await patient.save();

    try {
      await this.usersService.createUserForRole({
        username: createPatientDto.username,
        name: createPatientDto.name,
        email: createPatientDto.email,
        password: createPatientDto.password,
        role: UserRole.PATIENT,
        linkedId: savedPatient._id.toString(),
      });
    } catch (error) {
      await this.patientModel.findByIdAndDelete(savedPatient._id);
      throw error;
    }

    return savedPatient;
  }

  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().exec();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async hasAppointmentWithDoctor(patientId: string, doctorId: string): Promise<boolean> {
    const appointment = await this.appointmentModel
      .findOne({
        patientId: new Types.ObjectId(patientId),
        doctorId: new Types.ObjectId(doctorId),
      })
      .select('_id')
      .lean()
      .exec();

    return Boolean(appointment);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    if (updatePatientDto.email) {
      const existingPatient = await this.patientModel.findOne({
        email: updatePatientDto.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingPatient) {
        throw new ConflictException('Patient with this email already exists');
      }
    }

    const patient = await this.patientModel.findByIdAndUpdate(
      id,
      {
        ...updatePatientDto,
        email: updatePatientDto.email ? updatePatientDto.email.toLowerCase() : undefined,
      },
      { new: true, runValidators: true },
    );

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.patientModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Patient not found');
    }

    await this.usersService.deleteByLinkedId(id);

    return { message: 'Patient deleted successfully' };
  }
}
