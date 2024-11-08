import {
  Resolver,
  Query,
  Subscription,
  Mutation,
  Args,
  Int,
  Context,
} from '@nestjs/graphql';
import { SensorData } from '../models/sensor/sensor-data.model';
import { PubSub } from 'graphql-subscriptions';
import { Inject, UseGuards } from '@nestjs/common';
import { SensorService } from 'src/service/sensors.service';
import { GqlAuthGuard } from '../../guards/gql-auth.guard';

@Resolver(() => SensorData)
export class SensorsResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    @Inject(SensorService) private sensorService: SensorService,
  ) {
    this.sensorService.startDataStream((data) => {
      pubSub.publish('sensorsRead', { sensorsRead: data });
    });
  }

  @Mutation(() => Int)
  @UseGuards(GqlAuthGuard)
  async updateThrottleTime(
    @Args('time', { type: () => Int }) time: number,
  ): Promise<number> {
    await this.sensorService.updateThrottleTime(time);
    return time;
  }

  @Query(() => SensorData, { nullable: true })
  @UseGuards(GqlAuthGuard)
  sensorUpdate() {
    return this.sensorService.getLatestSensorData();
  }

  @Subscription(() => SensorData, {
    name: 'sensorsRead',
  })
  subscribeToSensorsRead() {
    return this.pubSub.asyncIterator('sensorsRead');
  }
}
