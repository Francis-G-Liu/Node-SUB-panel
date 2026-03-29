import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NodeModel {
  @Field()
  id!: string;

  @Field()
  providerId!: string;

  @Field()
  hostname!: string;

  @Field()
  region!: string;

  @Field(() => [String])
  tags!: string[];

  @Field(() => Float, { nullable: true })
  latencyMs?: number | null;
}
