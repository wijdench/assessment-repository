import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VehicleType {
  @Field()
  typeId: string;

  @Field()
  typeName: string;
}
