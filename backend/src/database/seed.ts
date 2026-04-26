import 'reflect-metadata';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  username:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone:        { type: String, default: '' },
  role:         { type: String, required: true, enum: ['admin', 'receptionist', 'doctor', 'patient'] },
  linkedId:     { type: mongoose.Schema.Types.ObjectId, refPath: 'role' },
}, { timestamps: true });

const ClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workingHours: { type: String, required: true },
  workingDays: { type: String, required: true },
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  workingDays: { type: String, required: true },
  workingHours: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true },
}, { timestamps: true });

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  email: { type: String, required: true },
  address: { type: String },
  medicalHistory: { type: String },
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
const ClinicModel = mongoose.model('Clinic', ClinicSchema);
const DoctorModel = mongoose.model('Doctor', DoctorSchema);
const PatientModel = mongoose.model('Patient', PatientSchema);

const SEED_DATA = [
  {
    user: { name: 'Admin User', username: 'admin', email: 'admin@clinic.com', password: '123456', role: 'admin' },
  },
  {
    user: { name: 'Dr. John Smith', username: 'doctor', email: 'doctor@clinic.com', password: '123456', role: 'doctor' },
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
    user: { name: 'Jane Receptionist', username: 'receptionist', email: 'receptionist@clinic.com', password: '123456', role: 'receptionist' },
  },
  {
    user: { name: 'Test Patient', username: 'patient', email: 'patient@clinic.com', password: '123456', role: 'patient' },
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

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_management';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create a default clinic if none exists
    let clinic = await ClinicModel.findOne();
    if (!clinic) {
      clinic = await ClinicModel.create({
        name: 'Main Clinic',
        workingHours: '8:00-18:00',
        workingDays: 'Mon-Sun',
      });
      console.log('Created default clinic');
    }

    for (const data of SEED_DATA) {
      const { user, doctor, patient } = data;

      // Check if user exists
      const exists = await UserModel.findOne({ email: user.email.toLowerCase() }).lean();
      if (exists) {
        console.log(`Skipped (already exists): ${user.email}`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      let linkedId: mongoose.Types.ObjectId | null = null;

      // Create linked entity if needed
      if (doctor) {
        const doctorDoc = await DoctorModel.create({ ...doctor, clinicId: clinic._id });
        linkedId = doctorDoc._id;
        console.log(`Created doctor: ${doctor.name}`);
      }

      if (patient) {
        const patientDoc = await PatientModel.create(patient);
        linkedId = patientDoc._id;
        console.log(`Created patient: ${patient.name}`);
      }

      // Create user
      await UserModel.create({
        ...user,
        email: user.email.toLowerCase(),
        passwordHash,
        linkedId,
      });

      console.log(`Seeded user: ${user.email} [${user.role}]`);
    }

    console.log('✅ Database seeding completed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
