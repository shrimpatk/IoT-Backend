import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserResolver } from './graphql/resolvers/user.resolver';
import { UserSettingsResolver } from './graphql/resolvers/user-setting.resolver';
import { PrismaService } from './prisma.service';
import { UserService } from './service/user.service';
import { SensorsResolver } from './graphql/resolvers/sensors.resolver';
import { PubSubModule } from './module/pub-sub.module';
import { SensorService } from './service/sensors.service';
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenCleanupService } from './service/token-cleanup.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
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
    PrismaService,
    AuthResolver,
    AuthService,
    TokenCleanupService,
    UserService,
    UserResolver,
    UserSettingsResolver,
    SensorService,
    SensorsResolver,
  ],
})
export class AppModule {}
