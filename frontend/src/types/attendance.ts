export interface Attendance {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInTime: string;
  photoPath: string;
  notes: string | null;
}

export interface AttendanceWithEmployee extends Attendance {
  employee: {
    fullName: string;
    employeeCode: string;
    department: string | null;
  } | null;
}

export interface DashboardSummary {
  date: string;
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  recentCheckIns: AttendanceWithEmployee[];
}