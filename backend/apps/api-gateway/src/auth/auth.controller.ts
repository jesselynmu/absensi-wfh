import { Body, Controller, HttpCode, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendToService } from '../common/send-to-service';
import { AllowDuringPasswordChange } from './allow-during-password-change.decorator';
import { CurrentUser } from './current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt-payload';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login dan dapatkan access token (JWT)' })
  login(@Body() dto: LoginDto) {
    return sendToService(this.authClient, { cmd: 'auth.login' }, dto);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @AllowDuringPasswordChange()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ganti password sendiri',
    description:
      'Tetap bisa diakses saat user masih wajib ganti password. Mengembalikan access token baru.',
  })
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return sendToService(this.authClient, { cmd: 'auth.changePassword' }, {
      userId: user.sub,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }
}