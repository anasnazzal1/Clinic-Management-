import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient, PatientSchema } from './entities/patient.entity';
import { Appointment, AppointmentSchema } from '../appointments/entities/appointment.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    UsersModule,
  ],
  providers: [PatientsService],
  controllers: [PatientsController],
})
export class PatientsModule {}
