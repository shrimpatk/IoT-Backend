import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserSetting } from '../models/user/user-setting.model';
import { CreateUserSettingInput } from '../utils/CreateUserSettingsInput';
import { mockUserSettings } from 'src/__mocks__/mockUserSettings';

@Resolver()
export class UserSettingsResolver {
  @Mutation(() => UserSetting)
  createUserSettings(
    @Args('createUserSettingsData')
    createUserSettingsData: CreateUserSettingInput,
  ) {
    mockUserSettings.push(createUserSettingsData);
    return createUserSettingsData;
  }
}
