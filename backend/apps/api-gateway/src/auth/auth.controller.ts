import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendToService } from '../common/send-to-service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return sendToService(this.authClient, { cmd: 'auth.login' }, dto);
  }
}