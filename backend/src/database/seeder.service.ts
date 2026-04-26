import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../common/constants/roles.constant';
import { Clinic } from '../modules/clinics/entities/clinic.entity';
import { Doctor } from '../modules/doctors/entities/doctor.entity';
import { Patient } from '../modules/patients/entities/patient.entity';

const SEED_DATA = [
  {
    user: { name: 'Admin User', username: 'admin', email: 'admin@clinic.com', password: '123456', role: UserRole.ADMIN },
  },
  {
    user: { name: 'Dr. John Smith', username: 'doctor', email: 'doctor@clinic.com', password: '123456', role: UserRole.DOCTOR },
    doctor: {
      name: 'Dr. John Smith',
      specialization: 'General Medicine',
      workingDays: 'Mon-Fri',
      workingHours: '9:00-17:00',
      phone: '+1234567890',
      email: 'doctor@clinic.com',
    },
  },
  {
    user: { name: 'Jane Receptionist', username: 'receptionist', email: 'receptionist@clinic.com', password: '123456', role: UserRole.RECEPTIONIST },
  },
  {
    user: { name: 'Test Patient', username: 'patient', email: 'patient@clinic.com', password: '123456', role: UserRole.PATIENT },
    patient: {
      name: 'Test Patient',
      age: 30,
      gender: 'Female',
      phone: '+1234567891',
      email: 'patient@clinic.com',
      address: '123 Test Street',
      medicalHistory: 'No known allergies. Regular checkups.',
    },
  },
];

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Clinic.name) private readonly clinicModel: Model<Clinic>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    // Create a default clinic if none exists
    let clinic = await this.clinicModel.findOne();
    if (!clinic) {
      clinic = await this.clinicModel.create({
        name: 'Main Clinic',
        workingHours: '8:00-18:00',
        workingDays: 'Mon-Sun',
      });
      this.logger.log('Created default clinic');
    }

    for (const data of SEED_DATA) {
      const { user, doctor, patient } = data;

      // Check if user exists
      const exists = await this.userModel.findOne({ email: user.email.toLowerCase() }).lean();
      if (exists) continue;

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      let linkedId = null;

      // Create linked entity if needed
      if (doctor) {
        const doctorDoc = await this.doctorModel.create({ ...doctor, clinicId: clinic._id });
        linkedId = doctorDoc._id;
        this.logger.log(`Created doctor: ${doctor.name}`);
      }

      if (patient) {
        const patientDoc = await this.patientModel.create(patient);
        linkedId = patientDoc._id;
        this.logger.log(`Created patient: ${patient.name}`);
      }

      // Create user
      await this.userModel.create({
        ...user,
        email: user.email.toLowerCase(),
        passwordHash,
        linkedId,
      });

      this.logger.log(`Seeded user: ${user.email} [${user.role}]`);
    }

    this.logger.log('✅ Database seeding completed.');
  }
}
