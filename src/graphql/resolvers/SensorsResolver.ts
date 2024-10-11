import { Resolver, Query, Subscription, Mutation } from "@nestjs/graphql";
import { SensorsData } from "../models/SensorsData";
import { PubSub } from "graphql-subscriptions";
import { Inject } from "@nestjs/common";
import { SensorService } from "src/service/sensorsService";

@Resolver((of) => SensorsData)
export class SensorsResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub, 
    @Inject(SensorService) private sensorService: SensorService
  ) {
      this.sensorService.startDataStream((data) => {
        pubSub.publish('sensorsRead', { sensorsRead: data })
      })
  }

  @Query(() => [SensorsData], { nullable: true })
  sensorUpdate() {
    return this.sensorService.getLastestSensorData();
  }

  @Subscription(() => [SensorsData], {
    name: 'sensorsRead'
  })
  subscribeToSensorsRead() {
    return this.pubSub.asyncIterator('sensorsRead')
  }
}