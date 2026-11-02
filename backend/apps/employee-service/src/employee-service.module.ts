import { Module } from '@nestjs/common';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

@Module({
  imports: [],
  controllers: [EmployeeServiceController],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}
