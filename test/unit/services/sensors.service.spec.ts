import { Test, TestingModule } from '@nestjs/testing';
import { SensorService } from '../../../src/service/sensors.service';
import { WebSocket } from 'ws';
import { PrismaService } from '../../../src/prisma.service';
import { Logger } from '@nestjs/common';
import { GlobalSetting, Prisma } from '@prisma/client';

describe('SensorsService', () => {
  // Test Fixtures
  const MOCK_THROTTLE_TIME = 2000;
  const MOCK_SENSOR_DATA = {
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

  const MOCK_GLOBAL_SETTING: GlobalSetting = {
    key: 'throttle_time',
    value: MOCK_THROTTLE_TIME,
  };

  // Test Context
  let service: SensorService;
  let prismaService: PrismaService;
  let loggerSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
    verbose: jest.SpyInstance;
  };

  const setupMocks = () => {
    // Setup PrismaService mock
    prismaService = {
      globalSetting: {
        findFirst: jest.fn().mockResolvedValue(MOCK_GLOBAL_SETTING),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest
          .fn()
          .mockImplementation((params: Prisma.GlobalSettingUpsertArgs) =>
            Promise.resolve({
              ...MOCK_GLOBAL_SETTING,
              key: params.where.key,
              value: (params.create as any).value,
            }),
          ),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
    } as unknown as PrismaService;

    // Setup Logger spies
    loggerSpy = {
      log: jest.spyOn(Logger.prototype, 'log').mockImplementation(),
      error: jest.spyOn(Logger.prototype, 'error').mockImplementation(),
      warn: jest.spyOn(Logger.prototype, 'warn').mockImplementation(),
      debug: jest.spyOn(Logger.prototype, 'debug').mockImplementation(),
      verbose: jest.spyOn(Logger.prototype, 'verbose').mockImplementation(),
    };

    return { prismaService, loggerSpy };
  };

  const cleanupWebSocket = (ws: WebSocket | undefined) => {
    if (ws) {
      ws.removeAllListeners();
      ws.close();
    }
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    const mocks = setupMocks();
    prismaService = mocks.prismaService;
    loggerSpy = mocks.loggerSpy;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<SensorService>(SensorService);
  });

  afterEach(() => {
    const ws = (service as any).ws;
    cleanupWebSocket(ws);
    jest.clearAllTimers();
    jest.useRealTimers();
    Object.values(loggerSpy).forEach((spy) => spy.mockRestore());
    jest.restoreAllMocks();
  });

  afterAll((done) => {
    const ws = (service as any).ws;
    if (ws) {
      ws.removeAllListeners();
      ws.close();
    }
    // Allow time for connections to close
    setTimeout(() => {
      done();
    }, 500);
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      expect(loggerSpy.log.mock.calls.flat()).toContain(
        'Initializing Sensor Service',
      );
    });

    it('should attempt websocket connection on initialization', () => {
      expect(loggerSpy.debug.mock.calls.flat()).toContain(
        'Attempting to connect to WebSocket at ws://192.168.1.2:1880/ws/pub',
      );
      expect(loggerSpy.debug.mock.calls.flat()).toContain(
        'Loading throttle settings from database',
      );
    });

    it('should load throttle settings on initialization', () => {
      expect(prismaService.globalSetting.findFirst).toHaveBeenCalledWith({
        where: { key: 'throttle_time' },
      });
    });
  });

  describe('WebSocket Communication', () => {
    describe('Data Reception', () => {
      it('should properly receive and process incoming data', () => {
        const callback = jest.fn();
        service.startDataStream(callback);

        const ws = (service as any).ws;
        const messageEvent = Buffer.from(JSON.stringify(MOCK_SENSOR_DATA));

        ws.emit('message', messageEvent);

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
      });
    });

    describe('Throttling', () => {
      it('should properly throttle frequent data updates', () => {
        const callback = jest.fn();
        service.startDataStream(callback);

        const ws = (service as any).ws;
        const messageData = Buffer.from(JSON.stringify(MOCK_SENSOR_DATA));

        // Send multiple messages
        ws.emit('message', messageData);
        ws.emit('message', messageData);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(loggerSpy.verbose.mock.calls.flat()).toContain(
          'Received sensor data from 1 devices',
        );
        expect(loggerSpy.verbose).toHaveBeenCalledWith(
          expect.stringContaining('Skipping data publish (throttled)'),
        );
      });

      it('should allow updates after throttle time', () => {
        const callback = jest.fn();
        service.startDataStream(callback);

        const ws = (service as any).ws;
        const messageData = Buffer.from(JSON.stringify(MOCK_SENSOR_DATA));

        ws.emit('message', messageData);
        expect(callback).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(MOCK_THROTTLE_TIME + 100);

        ws.emit('message', messageData);
        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe('Error Handling', () => {
      it('should properly log websocket connection errors', () => {
        const error = new Error('Connection failed');
        const ws = (service as any).ws;

        ws.emit('error', error);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'WebSocket connection error:',
          expect.any(String),
        );
      });

      it('should attempt reconnection when connection closes', () => {
        const ws = (service as any).ws;
        const connectSpy = jest.spyOn(service as any, 'connectWebSocket');

        ws.emit('close');

        expect(loggerSpy.warn).toHaveBeenCalledWith(
          'WebSocket connection closed, attempting reconnection in 5 seconds',
        );

        jest.advanceTimersByTime(5000);
        expect(connectSpy).toHaveBeenCalled();
      });

      it('should handle message parsing errors', () => {
        const callback = jest.fn();
        service.startDataStream(callback);

        const ws = (service as any).ws;
        ws.emit('message', Buffer.from('invalid json'));

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Error parsing sensor data:',
          expect.any(String),
        );
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('Throttle Settings', () => {
    it('should get current throttle time', async () => {
      const time = await service.getThrottleTime();
      expect(time).toBe(MOCK_THROTTLE_TIME);
    });

    it('should update throttle time', async () => {
      const newTime = 5000;
      await service.updateThrottleTime(newTime);

      expect(prismaService.globalSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'throttle_time' },
        update: { value: newTime },
        create: { key: 'throttle_time', value: newTime },
      });
    });

    it('should reject invalid throttle times', async () => {
      const invalidTime = 500;
      await expect(service.updateThrottleTime(invalidTime)).rejects.toThrow(
        'Throttle time must be between 1000ms and 30000ms',
      );
    });
  });
});
