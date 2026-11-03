import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

const notFound = () =>
  new RpcException({
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Data karyawan tidak ditemukan',
  });

const mapDbError = (err: any) =>
  err?.code === 'ER_DUP_ENTRY'
    ? new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Kode karyawan atau email sudah digunakan',
      })
    : err;

@Injectable()
export class EmployeeServiceService {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
  ) {}

  findAll(filter: { search?: string; status?: string }) {
    const base: FindOptionsWhere<Employee> = {};
    if (filter.status === 'active') base.isActive = true;
    if (filter.status === 'inactive') base.isActive = false;

    const keyword = filter.search?.trim();
    const where = keyword
      ? [
          { ...base, fullName: Like(`%${keyword}%`) },
          { ...base, employeeCode: Like(`%${keyword}%`) },
          { ...base, email: Like(`%${keyword}%`) },
        ]
      : base;

    return this.repo.find({ where, order: { fullName: 'ASC' } });
  }

  async findOne(id: number) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw notFound();
    return employee;
  }

  async findByIds(ids: number[]) {
    if (!ids?.length) return [];
    return this.repo.find({ where: { id: In(ids) } });
  }

  async stats() {
    const [total, active] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { isActive: true } }),
    ]);
    return { total, active };
  }

  async create(data: Partial<Employee>) {
    try {
      return await this.repo.save(this.repo.create({ ...data, isActive: true }));
    } catch (err) {
      throw mapDbError(err);
    }
  }

  async update(id: number, changes: Partial<Employee>) {
    const employee = await this.findOne(id);
    Object.assign(employee, changes);
    try {
      return await this.repo.save(employee);
    } catch (err) {
      throw mapDbError(err);
    }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw notFound();
    return { id };
  }
}