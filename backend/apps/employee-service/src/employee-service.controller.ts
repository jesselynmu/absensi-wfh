import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeServiceService } from './employee-service.service';
import type { Employee } from './entities/employee.entity';

@Controller()
export class EmployeeServiceController {
  constructor(private readonly employeeService: EmployeeServiceService) {}

  @MessagePattern({ cmd: 'employee.findAll' })
  findAll(@Payload() filter: { search?: string; status?: string }) {
    return this.employeeService.findAll(filter);
  }

  @MessagePattern({ cmd: 'employee.findOne' })
  findOne(@Payload() data: { id: number }) {
    return this.employeeService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'employee.findByIds' })
  findByIds(@Payload() data: { ids: number[] }) {
    return this.employeeService.findByIds(data.ids);
  }

  @MessagePattern({ cmd: 'employee.stats' })
  stats() {
    return this.employeeService.stats();
  }

  @MessagePattern({ cmd: 'employee.create' })
  create(@Payload() data: Partial<Employee>) {
    return this.employeeService.create(data);
  }

  @MessagePattern({ cmd: 'employee.update' })
  update(@Payload() data: { id: number; changes: Partial<Employee> }) {
    return this.employeeService.update(data.id, data.changes);
  }

  @MessagePattern({ cmd: 'employee.remove' })
  remove(@Payload() data: { id: number }) {
    return this.employeeService.remove(data.id);
  }
}