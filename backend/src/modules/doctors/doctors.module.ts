import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { Doctor, DoctorSchema } from './entities/doctor.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    UsersModule,
  ],
  providers: [DoctorsService],
  controllers: [DoctorsController],
})
export class DoctorsModule {}
