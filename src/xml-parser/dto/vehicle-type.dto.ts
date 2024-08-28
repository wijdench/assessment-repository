// src/xml-parser/dto/vehicle-type.dto.ts

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VehicleTypeDto {
  @Field()
  typeId: string;

  @Field()
  typeName: string;
}
