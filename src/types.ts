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
  emergencyContact?: string;
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
  taxRate?: number;
  bpjsHealthRate?: number;
  bpjsEmploymentRate?: number;
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
  attachmentPath?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt?: Timestamp;
  decidedAt?: Timestamp;
  requiredApprovals?: number;
  approvalStep?: number;
  approverIds?: string[];
  approvalHistory?: Array<{ approverId: string; approverName: string; decision: "approved" | "rejected"; note: string; at: string }>;
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
  reimbursement?: number;
  bpjsHealth?: number;
  bpjsEmployment?: number;
  incomeTax?: number;
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
  requestApprovalLevels?: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "employee" | "admin";
  active: boolean;
  createdAt?: Timestamp;
}

export interface HrDocument {
  id: string;
  title: string;
  category: string;
  url: string;
  audience: "all" | "employee" | "admin";
  active: boolean;
  createdAt?: Timestamp;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  dueDate: string;
  progress: number;
  status: "active" | "completed";
  createdAt?: Timestamp;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  position: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  notes: string;
  phone?: string;
  source?: string;
  experienceYears?: number;
  expectedSalary?: number;
  skills?: string[];
  cvKey?: string;
  cvName?: string;
  hiredEmployeeId?: string;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface EmployeeContract {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  contractNumber: string;
  type: "PKWT" | "PKWTT" | "Freelance" | "Internship";
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "expired" | "terminated";
  notes?: string;
  fileKey?: string;
  fileName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
