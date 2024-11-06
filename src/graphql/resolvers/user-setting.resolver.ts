import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserSettingModel } from '../models/user/user-setting.model';
import { CreateUserSettingInput } from '../utils/CreateUserSettingsInput';
import { mockUserSettings } from 'src/__mocks__/mockUserSettings';

@Resolver()
export class UserSettingsResolver {
  @Mutation((returns) => UserSettingModel)
  createUserSettings(
    @Args('createUserSettingsData')
    createUserSettingsData: CreateUserSettingInput,
  ) {
    mockUserSettings.push(createUserSettingsData);
    return createUserSettingsData;
  }
}
