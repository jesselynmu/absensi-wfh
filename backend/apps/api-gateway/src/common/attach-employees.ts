import { ClientProxy } from '@nestjs/microservices';
import { sendToService } from './send-to-service';
import type { AttendanceRecord, EmployeeRecord } from './types';

export async function attachEmployees(
  employeeClient: ClientProxy,
  records: AttendanceRecord[],
) {
  const ids = [...new Set(records.map((r) => r.employeeId))];
  if (ids.length === 0) return [];

  const employees = await sendToService<EmployeeRecord[]>(
    employeeClient,
    { cmd: 'employee.findByIds' },
    { ids },
  );
  const byId = new Map(employees.map((e) => [e.id, e]));

  return records.map((record) => {
    const employee = byId.get(record.employeeId);
    return {
      ...record,
      employee: employee
        ? {
            fullName: employee.fullName,
            employeeCode: employee.employeeCode,
            department: employee.department,
          }
        : null,
    };
  });
}