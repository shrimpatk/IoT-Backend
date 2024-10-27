import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RefreshTokenInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  access_token: string;
}
