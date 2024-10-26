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
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './graphql/resolvers/AuthResolver';
import { AuthService } from './service/authService';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PubSubModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use environment variable in production
      signOptions: { expiresIn: '1h' },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  controllers: [],
  providers: [
    AuthResolver,
    AuthService,
    PrismaService,
    UserService,
    UserResolver,
    SensorService,
    SensorsResolver,
    UserSettingsResolver,
  ],
})
export class AppModule {}
