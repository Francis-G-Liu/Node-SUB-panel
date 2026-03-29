import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TicketModel {
  @Field()
  id!: string;

  @Field()
  subject!: string;

  @Field()
  status!: string;

  @Field()
  priority!: string;
}
