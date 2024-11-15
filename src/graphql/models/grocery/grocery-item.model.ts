import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GroceryItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  defaultUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
