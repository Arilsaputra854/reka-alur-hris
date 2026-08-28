import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "employee";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
  employeeId?: string;
  createdAt?: Timestamp;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive";
  joinDate: string;
  shiftStart: string;
  shiftEnd: string;
  workLocationId: string;
  baseSalary: number;
  allowance: number;
  faceEnrolled: boolean;
  annualLeaveQuota?: number;
  annualLeaveUsed?: number;
  createdAt?: Timestamp;
}

export type RequestCategory = "leave" | "overtime" | "reimbursement";

export interface EmployeeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  category: RequestCategory;
  requestType: string;
  startDate: string;
  endDate: string;
  hours: number;
  amount: number;
  reason: string;
  status: "submitted" | "approved" | "rejected";
  decisionNote?: string;
  createdAt?: Timestamp;
  decidedAt?: Timestamp;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "check-in" | "check-out";
  clientTimestamp: string;
  dateKey: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceMeters: number;
  faceVerified: boolean;
  faceScore: number;
  status: "valid" | "late" | "outside" | "review";
  createdAt?: Timestamp;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  lateTolerance: number;
  active: boolean;
}

export interface PayrollRun {
  id: string;
  period: string;
  status: "draft" | "review" | "published";
  employeeCount: number;
  totalGross: number;
  totalDeduction: number;
  totalNet: number;
  createdAt?: Timestamp;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  period: string;
  baseSalary: number;
  allowance: number;
  attendanceAllowance: number;
  overtime: number;
  deduction: number;
  gross: number;
  net: number;
  status: "draft" | "published";
  payrollRunId: string;
  createdAt?: Timestamp;
}

export interface TrackingSession {
  id: string;
  employeeId: string;
  employeeName: string;
  status: "active" | "finished";
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  lastLatitude?: number;
  lastLongitude?: number;
  lastAccuracy?: number;
  lastUpdatedAt?: Timestamp;
  pointCount: number;
}

export interface CompanySettings {
  name: string;
  address: string;
  timezone: string;
  attendanceRadius: number;
  faceVerification: boolean;
  geoTracking: boolean;
  payrollCutoffDay: number;
}
