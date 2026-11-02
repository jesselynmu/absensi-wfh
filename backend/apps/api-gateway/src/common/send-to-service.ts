import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export async function sendToService<T>(
  client: ClientProxy,
  pattern: object,
  data: unknown,
): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (err: any) {
    if (err?.statusCode) {
      throw new HttpException(err.message, err.statusCode);
    }
    throw new HttpException(
      'Layanan sedang tidak tersedia',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}