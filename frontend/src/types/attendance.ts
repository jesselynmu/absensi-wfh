export interface Attendance {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInTime: string;
  photoPath: string;
  notes: string | null;
}