import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceptionistsService } from './receptionists.service';
import { ReceptionistsController } from './receptionists.controller';
import { Receptionist, ReceptionistSchema } from './entities/receptionist.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Receptionist.name, schema: ReceptionistSchema }]),
    UsersModule,
  ],
  providers: [ReceptionistsService],
  controllers: [ReceptionistsController],
})
export class ReceptionistsModule {}
