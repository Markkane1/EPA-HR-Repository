export type OfficeType = 'Directorate' | 'Regional' | 'Field Office';

export interface Office {
  id: string;
  name: string;
  type: OfficeType;
  location: string;
  district: string;
}

export interface Position {
  id: string;
  officeId: string;
  title: string;
  scale: string;
  allocatedSeatsCount: number;
}

export interface Seat {
  id: string;
  positionId: string;
  name: string;
}

export type EmployeeStatus = 'active' | 'retired' | 'transferred';

export interface Employee {
  id: string;
  name: string;
  fatherName: string;
  cnic: string;
  dob: string;
  doj: string;
  scale: string;
  contactNumber: string;
  photoColor: string;
  status: EmployeeStatus;
}

export interface Posting {
  id: string;
  employeeId: string;
  seatId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  orderNumber: string;
  remarks?: string;
}

export interface Attachment {
  id: string;
  employeeId: string;
  targetOfficeId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  orderNumber: string;
  reason: string;
}

export interface PersonnelState {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
}
