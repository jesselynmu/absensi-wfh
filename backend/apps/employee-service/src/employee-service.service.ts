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
        message: 'Email sudah digunakan oleh karyawan lain',
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

  private async generateEmployeeCode() {
    const [last] = await this.repo.find({ order: { id: 'DESC' }, take: 1 });
    const lastNumber = Number(last?.employeeCode.match(/(\d+)$/)?.[1] ?? 0);
    return `EMP${String(lastNumber + 1).padStart(3, '0')}`;
  }

  async create(data: Partial<Employee>) {
    // Dicoba ulang kalau kebetulan dua admin menambah karyawan di detik yang sama
    for (let attempt = 0; attempt < 3; attempt++) {
      const employeeCode = await this.generateEmployeeCode();
      try {
        return await this.repo.save(
          this.repo.create({ ...data, employeeCode, isActive: true }),
        );
      } catch (err: any) {
        const codeClash =
          err?.code === 'ER_DUP_ENTRY' && String(err?.sqlMessage).includes('employee_code');
        if (!codeClash) throw mapDbError(err);
      }
    }
    throw new RpcException({
      statusCode: HttpStatus.CONFLICT,
      message: 'Gagal membuat kode karyawan, silakan coba lagi',
    });
  }

  async update(id: number, changes: Partial<Employee>) {
    const employee = await this.findOne(id);
    // Kode karyawan dikunci: apa pun yang dikirim, nilai lama dipertahankan
    Object.assign(employee, { ...changes, employeeCode: employee.employeeCode });
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