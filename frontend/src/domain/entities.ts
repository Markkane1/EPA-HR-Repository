export interface Role {
  id: string;
  name: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId?: string | null;
  role?: Role | null;
  officeId?: string | null;
  status?: string;
}

// All available permissions in the system (mirror of backend)
export const ALL_PERMISSIONS = [
  'dashboard.read',
  'employees.read',
  'employees.write',
  'offices.read',
  'offices.write',
  'users.read',
  'users.write',
  'roles.write',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard.read': 'View Dashboard',
  'employees.read': 'View Employees',
  'employees.write': 'Manage Employees',
  'offices.read': 'View Offices',
  'offices.write': 'Manage Offices',
  'users.read': 'View Users',
  'users.write': 'Manage Users',
  'roles.write': 'Manage Roles',
};

export interface Employee {
  id: string;
  name: string;
  fatherName?: string;
  cnic: string;
  dob?: Date;
  dateOfJoining?: Date;
  basicScale?: number;
  contactNumber?: string;
  photoUrl?: string;
  status: 'active' | 'retired' | 'transferred';
}

export interface Office {
  id: string;
  name: string;
  type: 'Directorate' | 'Regional Office' | 'Field Office';
  location: string;
  district?: string;
}

export interface Position {
  id: string;
  officeId: string;
  title: string;
  basicScale?: number;
  totalSeats: number;
}

export interface Seat {
  id: string;
  positionId: string;
  officeId: string;
  seatNumber: number;
  status: 'occupied' | 'vacant';
}

export interface Posting {
  id: string;
  employeeId: string;
  seatId: string;
  officeId: string;
  positionId: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  orderNumber?: string;
  remarks?: string;
}

export interface Attachment {
  id: string;
  employeeId: string;
  officeId: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  orderNumber?: string;
  reason: string;
}

export interface EmployeeListItem extends Employee {
  currentOffice?: Office;
  currentPosition?: Position;
  currentPosting?: Posting | null;
  activeAttachment?: Attachment | null;
}

export interface EmployeeProfile extends Employee {
  currentPosting?: Posting | null;
  currentAttachment?: Attachment | null;
  postingHistory: Posting[];
  attachmentHistory: Attachment[];
}

export interface OfficeDashboard {
  office: Office;
  positions: Position[];
  seats: Seat[];
  currentOccupants: Employee[];
  currentlyAttached: Attachment[];
  currentPostings: Posting[];
}

export interface OfficeStat {
  office: Office;
  totalSeats: number;
  occupiedSeats: number;
  vacantSeats: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalOffices: number;
  totalVacantSeats: number;
  currentlyAttachedCount: number;
  allOffices: OfficeStat[];
  attachedEmployeesList: { employee: Employee; attachment: Attachment; attachedToOffice: Office }[];
}
