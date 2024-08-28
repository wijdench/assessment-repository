import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Make } from '../database/schemas/make.schema';

@Injectable()
export class VehicleDatabaseService {
  constructor(@InjectModel('Make') private readonly makeModel: Model<Make>) {}

  async saveMakes(makes: Make[]): Promise<void> {
    await this.makeModel.insertMany(makes);
  }

  async getAllMakes(): Promise<Make[]> {
    return this.makeModel.find().exec();
  }
}
