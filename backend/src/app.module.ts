import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ReceptionistsModule } from './modules/receptionists/receptionists.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { VisitsModule } from './modules/visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ClinicsModule,
    DoctorsModule,
    PatientsModule,
    ReceptionistsModule,
    AppointmentsModule,
    VisitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


