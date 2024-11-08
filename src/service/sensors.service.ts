import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { SensorDataInterface } from '../interfaces/sensor-data.interface';

@Injectable()
export class SensorService {
  private NODE_RED_URL = 'ws://192.168.1.2:1880/ws/pub';
  private ws: WebSocket;
  private lastSentTime: number = 0;
  private THROTTLE_TIME = 2000;
  private latestData: SensorDataInterface | null = null;

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.ws = new WebSocket(this.NODE_RED_URL);

    this.ws.on('open', () => {
      console.log('Connected to Node-Red WebSocket');
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error: ', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed. Reconnecting...');
      setTimeout(() => this.connectWebSocket(), 5000);
    });
  }

  async getLatestSensorData(): Promise<SensorDataInterface> {
    return this.latestData || null;
  }

  startDataStream(callback: (data: SensorDataInterface) => void) {
    this.ws.on('message', (message: Buffer) => {
      try {
        const now = Date.now();
        const data = JSON.parse(message.toString()) as SensorDataInterface;
        console.log('data: ', data.devices[0].sensors);

        this.latestData = data;

        if (now - this.lastSentTime >= this.THROTTLE_TIME) {
          callback(data);
          this.lastSentTime = now;
          console.log('Pub');
        } else {
          console.log('Skipped publishing (throttled)');
        }
      } catch (error) {
        console.error('Error parsing sensor data:', error);
      }
    });
  }
}
