import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { ShoppingListItem } from './shopping-list-item.model';

@ObjectType()
export class ShoppingList {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => User)
  owner: User;

  @Field()
  status: string;

  @Field(() => [ShoppingListItem])
  items: ShoppingListItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
