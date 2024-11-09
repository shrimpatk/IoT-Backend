import { Test, TestingModule } from '@nestjs/testing';
import { SensorService } from '../../../src/service/sensors.service';
import { WebSocket } from 'ws';
import { PrismaService } from '../../../src/prisma.service';

describe('SensorsService', () => {
  let service: SensorService;
  let mockPrisma: any;

  const mockSensorData = {
    timestamp: Date.now(),
    devices: [
      {
        device_id: 'TEST_001',
        sensors: {
          environmental: {
            temperature: { value: 25 },
            humidity: { value: 50 },
          },
        },
      },
    ],
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    mockPrisma = {
      globalSetting: {
        findFirst: jest.fn().mockResolvedValue({ value: 2000 }),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SensorService>(SensorService);
  });

  afterEach(() => {
    const ws = (service as any).ws;
    if (ws) {
      ws.removeAllListeners();
      ws.close();
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  afterAll((done) => {
    jest.restoreAllMocks();
    const ws = (service as any).ws;
    if (ws) {
      ws.close();
    }
    done();
  });

  describe('WebSocket', () => {
    it('should receive and process data', (done) => {
      const callback = jest.fn();

      service.startDataStream(callback);

      // Simulate receiving WebSocket message
      const ws = (service as any).ws; // Access private property for testing
      const messageEvent = Buffer.from(JSON.stringify(mockSensorData));

      ws.emit('message', messageEvent);

      // Check if callback was called with data
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          devices: expect.arrayContaining([
            expect.objectContaining({
              device_id: expect.any(String),
            }),
          ]),
        }),
      );

      done();
    });

    it('should throttle frequent updates', (done) => {
      const callback = jest.fn();
      service.startDataStream(callback);

      const ws = (service as any).ws;

      // Send first message
      // Send second message immediately
      // Should only be called once due to throttling
      ws.emit('message', Buffer.from(JSON.stringify(mockSensorData)));
      ws.emit('message', Buffer.from(JSON.stringify(mockSensorData)));
      expect(callback).toHaveBeenCalledTimes(1);

      done();
    });

    it('should handle connection errors', (done) => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const ws = (service as any).ws;

      ws.emit('error', new Error('connection error'));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      done();
    });
  });

  describe('Throttle Settings', () => {
    it('should get throttle time', async () => {
      const time = await service.getThrottleTime();
      expect(time).toBe(2000);
    });

    it('should update throttle time', async () => {
      await service.updateThrottleTime(5000);
      expect(mockPrisma.globalSetting.upsert).toHaveBeenCalled();
    });
  });
});
