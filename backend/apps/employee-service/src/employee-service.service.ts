import { Injectable } from '@nestjs/common';

@Injectable()
export class EmployeeServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
