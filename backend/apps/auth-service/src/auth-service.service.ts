import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

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

  async createAccount(data: {
    employeeId: number;
    email: string;
    password: string;
    role: UserRole;
  }) {
    try {
      const user = await this.users.save(
        this.users.create({
          employeeId: data.employeeId,
          email: data.email,
          role: data.role,
          passwordHash: await bcrypt.hash(data.password, 10),
        }),
      );
      return this.toAccount(user);
    } catch (err) {
      throw this.mapDbError(err);
    }
  }

  async updateAccount(data: {
    employeeId: number;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    password?: string;
  }) {
    const user = await this.users.findOne({ where: { employeeId: data.employeeId } });
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Akun karyawan tidak ditemukan',
      });
    }

    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role;
    if (typeof data.isActive === 'boolean') user.isActive = data.isActive;
    if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);

    try {
      return this.toAccount(await this.users.save(user));
    } catch (err) {
      throw this.mapDbError(err);
    }
  }

  async findAccounts(employeeIds: number[]) {
    if (!employeeIds?.length) return [];
    const users = await this.users.find({ where: { employeeId: In(employeeIds) } });
    return users.map((user) => this.toAccount(user));
  }
}