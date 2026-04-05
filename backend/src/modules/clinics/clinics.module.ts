import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { Clinic, ClinicSchema } from './entities/clinic.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Clinic.name, schema: ClinicSchema }])],
  providers: [ClinicsService],
  controllers: [ClinicsController],
})
export class ClinicsModule {}
