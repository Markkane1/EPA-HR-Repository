import { User, Employee, Office, DashboardStats, EmployeeProfile, EmployeeListItem, OfficeDashboard, Posting, Attachment } from '../domain/entities';

export interface IApiService {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  register(userData: any): Promise<User>;
  getMe(): Promise<User>;
  getEmployees(filters?: any): Promise<EmployeeListItem[]>;
  getEmployee(id: string): Promise<EmployeeProfile>;
  createEmployee(employeeData: any, postingData: any): Promise<Employee>;
  updateEmployee(id: string, employeeData: any): Promise<Employee>;
  getOffices(): Promise<Office[]>;
  getOffice(id: string): Promise<OfficeDashboard>;
  getDashboardStats(): Promise<DashboardStats>;
  getPostingHistory(employeeId: string): Promise<any[]>;
  getAttachmentHistory(employeeId: string): Promise<any[]>;
  recordTransfer(employeeId: string, postingData: any): Promise<Posting>;
  recordAttachment(attachmentData: any): Promise<Attachment>;
  endAttachment(attachmentId: string, effectiveTo?: Date): Promise<Attachment>;
  createOffice(officeData: any): Promise<Office>;
  updateOffice(id: string, officeData: any): Promise<Office>;
  createPosition(officeId: string, positionData: any): Promise<any>;
  updatePosition(officeId: string, positionId: string, positionData: any): Promise<any>;
  deletePosition(officeId: string, positionId: string): Promise<void>;
}
