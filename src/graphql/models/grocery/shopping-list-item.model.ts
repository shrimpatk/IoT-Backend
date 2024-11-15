import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ShoppingList } from './shopping-list.model';
import { GroceryItem } from './grocery-item.model';
import { User } from '../user/user.model';

@ObjectType()
export class ShoppingListItem {
  @Field(() => ID)
  id: string;

  @Field(() => ShoppingList)
  shoppingList: ShoppingList;

  @Field(() => GroceryItem)
  groceryItems: GroceryItem;

  @Field(() => Int)
  quantity: number;

  @Field()
  bought: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  customUrl?: string;

  @Field(() => User)
  addedBy: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
