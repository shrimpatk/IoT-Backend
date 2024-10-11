import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UserSetting } from "../models/user/UserSetting";
import { CreateUserSettingInput } from "../utils/CreateUserSettingsInput";
import { mockUserSettings } from "src/__mocks__/mockUserSettings";

@Resolver()
export class UserSettingsResolver {
  @Mutation(returns => UserSetting)
  createUserSettings(
    @Args('createUserSettingsData') 
    createUserSettingsData: CreateUserSettingInput
  ) {
    mockUserSettings.push(createUserSettingsData);
    return createUserSettingsData;
  }
}