import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeServiceController],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}