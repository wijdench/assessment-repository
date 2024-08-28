import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MakeSchema } from './schemas/make.schema';
import { VehicleDatabaseService } from './database.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Make', schema: MakeSchema }])],
  providers: [VehicleDatabaseService],
  exports: [VehicleDatabaseService, MongooseModule],
})
export class DatabaseModule {}
