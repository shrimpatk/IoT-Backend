import { Resolver, Query, Subscription } from '@nestjs/graphql';
import { SensorData } from '../models/sensor-data.model';
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
