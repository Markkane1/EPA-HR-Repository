export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  officeId?: string | null;
}

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
