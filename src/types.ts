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
  scale: string; // BS-1 to BS-18 or other scale titles
  allocatedSeatsCount: number;
}

export interface Seat {
  id: string;
  positionId: string;
  name: string; // e.g., "Seat 1", "Seat 2"
}

export type EmployeeStatus = 'active' | 'retired' | 'transferred';

export interface Employee {
  id: string;
  name: string;
  fatherName: string;
  cnic: string; // e.g., "35201-1234567-9"
  dob: string; // YYYY-MM-DD
  doj: string; // YYYY-MM-DD (Date of Joining)
  scale: string; // BS grade (e.g. BS-16, BS-17)
  contactNumber: string;
  photoColor: string; // Tailwind color name like 'emerald', 'indigo', etc.
  status: EmployeeStatus;
}

export interface Posting {
  id: string;
  employeeId: string;
  seatId: string;
  effectiveFrom: string;
  effectiveTo: string | null; // null if currently active
  orderNumber: string;
  remarks?: string;
}

export interface Attachment {
  id: string;
  employeeId: string;
  targetOfficeId: string;
  effectiveFrom: string;
  effectiveTo: string | null; // null if active
  orderNumber: string;
  reason: string;
}
