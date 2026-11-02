import { Controller, Get } from '@nestjs/common';
import { EmployeeServiceService } from './employee-service.service';

@Controller()
export class EmployeeServiceController {
  constructor(private readonly employeeServiceService: EmployeeServiceService) {}

  @Get()
  getHello(): string {
    return this.employeeServiceService.getHello();
  }
}
