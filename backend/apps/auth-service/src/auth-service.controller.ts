import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';
import { UserRole } from './entities/user.entity';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @MessagePattern({ cmd: 'auth.login' })
  login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern({ cmd: 'auth.createAccount' })
  createAccount(@Payload() data: { employeeId: number; email: string; password: string; role: UserRole }) {
    return this.authService.createAccount(data);
  }

  @MessagePattern({ cmd: 'auth.updateAccount' })
  updateAccount(
    @Payload()
    data: { employeeId: number; email?: string; role?: UserRole; isActive?: boolean; password?: string },
  ) {
    return this.authService.updateAccount(data);
  }

  @MessagePattern({ cmd: 'auth.findAccounts' })
  findAccounts(@Payload() data: { employeeIds: number[] }) {
    return this.authService.findAccounts(data.employeeIds);
  }
}