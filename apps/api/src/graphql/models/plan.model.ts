import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlanModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  bandwidthLimitGb!: number;

  @Field(() => Int)
  durationDays!: number;

  @Field(() => Int)
  concurrentDevices!: number;
}
