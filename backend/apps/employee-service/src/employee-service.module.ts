import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/database';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeeServiceController],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}