import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceServiceController } from './attendance-service.controller';
import { AttendanceServiceService } from './attendance-service.service';

describe('AttendanceServiceController', () => {
  let attendanceServiceController: AttendanceServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceServiceController],
      providers: [AttendanceServiceService],
    }).compile();

    attendanceServiceController = app.get<AttendanceServiceController>(AttendanceServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(attendanceServiceController.getHello()).toBe('Hello World!');
    });
  });
});
