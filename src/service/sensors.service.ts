import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { SensorDataInterface } from '../interfaces/sensor-data.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SensorService {
  private readonly logger = new Logger(SensorService.name);
  private NODE_RED_URL = 'ws://192.168.1.2:1880/ws/pub';
  private ws: WebSocket;
  private lastSentTime: number = 0;
  private THROTTLE_TIME = 2000;
  private latestData: SensorDataInterface | null = null;

  constructor(private prisma: PrismaService) {
    this.logger.log('Initializing Sensor Service');
    this.connectWebSocket();
    this.loadThrottleSettings();
  }

  private connectWebSocket() {
    this.logger.debug(
      `Attempting to connect to WebSocket at ${this.NODE_RED_URL}`,
    );
    this.ws = new WebSocket(this.NODE_RED_URL);

    this.ws.on('open', () => {
      this.logger.log('Successfully connected to Node-RED WebSocket');
    });

    this.ws.on('error', (error) => {
      this.logger.error('WebSocket connection error:', error.stack);
    });

    this.ws.on('close', () => {
      this.logger.warn(
        'WebSocket connection closed, attempting reconnection in 5 seconds',
      );
      setTimeout(() => this.connectWebSocket(), 5000);
    });
  }

  private async loadThrottleSettings() {
    try {
      this.logger.debug('Loading throttle settings from database');
      const setting = await this.prisma.globalSetting.findFirst({
        where: { key: 'throttle_time' },
      });

      if (setting) {
        this.THROTTLE_TIME = setting.value;
        this.logger.log(`Throttle time set to ${this.THROTTLE_TIME}ms`);
      } else {
        this.logger.debug(
          `Using default throttle time: ${this.THROTTLE_TIME}ms`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to load throttle settings:', error.stack);
      this.logger.warn(
        `Falling back to default throttle time: ${this.THROTTLE_TIME}ms`,
      );
    }
  }

  async getThrottleTime(): Promise<number> {
    this.logger.verbose(`Current throttle time: ${this.THROTTLE_TIME}ms`);
    return this.THROTTLE_TIME;
  }

  async updateThrottleTime(time: number): Promise<void> {
    this.logger.debug(`Attempting to update throttle time to ${time}ms`);

    if (time < 1000 || time > 1000 * 30) {
      const error = 'Throttle time must be between 1000ms and 30000ms';
      this.logger.error(error);
      throw new Error(error);
    }

    try {
      await this.prisma.globalSetting.upsert({
        where: { key: 'throttle_time' },
        update: { value: time },
        create: { key: 'throttle_time', value: time },
      });

      this.THROTTLE_TIME = time;
    } catch (error) {
      this.logger.error(
        'Failed to update throttle time in database:',
        error.stack,
      );
      throw error;
    }
  }

  async getLatestSensorData(): Promise<SensorDataInterface> {
    this.logger.verbose('Fetching latest sensor data');
    if (!this.latestData) {
      this.logger.debug('No sensor data available');
    }
    return this.latestData || null;
  }

  startDataStream(callback: (data: SensorDataInterface) => void) {
    this.logger.log('Starting sensor data stream');

    this.ws.on('message', (message: Buffer) => {
      try {
        const now = Date.now();
        const data = JSON.parse(message.toString()) as SensorDataInterface;

        this.logger.verbose(
          `Received sensor data from ${data.devices?.length || 0} devices`,
        );
        this.latestData = data;

        if (now - this.lastSentTime >= this.THROTTLE_TIME) {
          this.logger.debug('Publishing sensor data to subscribers');
          callback(data);
          this.lastSentTime = now;
        } else {
          this.logger.verbose(`
            Skipping data publish (throttled) - Next publish in ${
              this.THROTTLE_TIME - (now - this.lastSentTime)
            }ms
          `);
        }
      } catch (error) {
        this.logger.error('Error parsing sensor data:', error.stack);
      }
    });
  }
}
