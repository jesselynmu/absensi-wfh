import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { randomInt } from 'crypto';

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

const generatePassword = (length = 10) =>
  Array.from({ length }, () => PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)]).join('');

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });

    const valid =
      user && user.isActive && (await bcrypt.compare(password, user.passwordHash));

    if (!valid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Email atau password salah',
      });
    }

    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    };
  }

  private toAccount(user: User) {
    return {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private mapDbError(err: any) {
    return err?.code === 'ER_DUP_ENTRY'
      ? new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'Email sudah digunakan oleh akun lain',
        })
      : err;
  }

  async createAccount(data: { employeeId: number; email: string; role: UserRole }) {
    const temporaryPassword = generatePassword();
    try {
      const user = await this.users.save(
        this.users.create({
          employeeId: data.employeeId,
          email: data.email,
          role: data.role,
          passwordHash: await bcrypt.hash(temporaryPassword, 10),
        }),
      );
      return { ...this.toAccount(user), temporaryPassword };
    } catch (err) {
      throw this.mapDbError(err);
    }
  }

  async updateAccount(data: {
    employeeId: number;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
  }) {
    const user = await this.findByEmployeeId(data.employeeId);

    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role;
    if (typeof data.isActive === 'boolean') user.isActive = data.isActive;

    try {
      return this.toAccount(await this.users.save(user));
    } catch (err) {
      throw this.mapDbError(err);
    }
  }

  async resetPassword(employeeId: number) {
    const user = await this.findByEmployeeId(employeeId);
    const temporaryPassword = generatePassword();
    user.passwordHash = await bcrypt.hash(temporaryPassword, 10);
    await this.users.save(user);
    return { temporaryPassword };
  }

  private async findByEmployeeId(employeeId: number) {
    const user = await this.users.findOne({ where: { employeeId } });
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Akun karyawan tidak ditemukan',
      });
    }
    return user;
  }

  async findAccounts(employeeIds: number[]) {
    if (!employeeIds?.length) return [];
    const users = await this.users.find({ where: { employeeId: In(employeeIds) } });
    return users.map((user) => this.toAccount(user));
  }

  async changePassword(data: { userId: number; currentPassword: string; newPassword: string }) {
    const user = await this.users.findOne({ where: { id: data.userId } });
    if (!user) {
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Akun tidak ditemukan' });
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password lama yang Anda masukkan salah',
      });
    }

    if (await bcrypt.compare(data.newPassword, user.passwordHash)) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password baru harus berbeda dari password lama',
      });
    }

    user.passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.users.save(user);
    return { message: 'Password berhasil diubah' };
  }
}