import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { UserSettingsResolver } from './graphql/resolvers/UserSettingResolver';
import { PrismaService } from './prisma.service';
import { UserService } from './service/userService';
import { SensorsResolver } from './graphql/resolvers/SensorsResolver';
import { PubSubModule } from './module/PubSubModule';
import { SensorService } from './service/sensorsService';

@Module({
  imports: [
    PubSubModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        "subscriptions-transport-ws": true
      },
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
    }),
  ],
  controllers: [],
  providers: [
    PrismaService, 
    UserService,
    UserResolver, 
    SensorService, 
    SensorsResolver,
    UserSettingsResolver,
  ],
})
export class AppModule {}
