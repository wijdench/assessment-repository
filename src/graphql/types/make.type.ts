import { ObjectType, Field } from '@nestjs/graphql';
import { VehicleType } from './vehicle-type.type';

@ObjectType()
export class Make {
  @Field()
  makeId: string;

  @Field()
  makeName: string;

  @Field(() => [VehicleType])
  vehicleTypes: VehicleType[];
}
