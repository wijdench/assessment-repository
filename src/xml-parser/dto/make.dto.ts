// src/xml-parser/dto/make.dto.ts

import { ObjectType, Field } from '@nestjs/graphql';
import { VehicleTypeDto } from './vehicle-type.dto';

@ObjectType()
export class MakeDto {
  @Field()
  makeId: string;

  @Field()
  makeName: string;

  @Field(() => [VehicleTypeDto])
  vehicleTypes: VehicleTypeDto[];
}
