import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { Visit, VisitSchema } from './entities/visit.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }])],
  providers: [VisitsService],
  controllers: [VisitsController],
})
export class VisitsModule {}
