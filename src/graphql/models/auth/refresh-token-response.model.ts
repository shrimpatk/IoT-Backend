import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}
