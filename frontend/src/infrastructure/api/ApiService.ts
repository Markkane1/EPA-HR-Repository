import axios from 'axios';
import { IApiService } from '../../application/ports/IApiService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ApiService implements IApiService {
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data;
  }
  async register(userData: any) {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  }
  async getMe() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  }
  async getEmployees(filters: any = {}) {
    const { data } = await apiClient.get('/employees', { params: filters });
    return data;
  }
  async getEmployee(id: string) {
    const { data } = await apiClient.get(`/employees/${id}`);
    return data;
  }
  async createEmployee(employeeData: any, postingData: any) {
    const { data } = await apiClient.post('/employees', { employeeData, postingData });
    return data;
  }
  async updateEmployee(id: string, employeeData: any) {
    const { data } = await apiClient.put(`/employees/${id}`, employeeData);
    return data;
  }
  async getOffices() {
    const { data } = await apiClient.get('/offices');
    return data;
  }
  async getOffice(id: string) {
    const { data } = await apiClient.get(`/offices/${id}`);
    return data;
  }
  async getDashboardStats() {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  }
  async getPostingHistory(employeeId: string) {
    const { data } = await apiClient.get(`/employees/${employeeId}/postings`);
    return data;
  }
  async getAttachmentHistory(employeeId: string) {
    const { data } = await apiClient.get(`/employees/${employeeId}/attachments`);
    return data;
  }
  async recordTransfer(employeeId: string, postingData: any) {
    const { data } = await apiClient.post('/postings/transfer', { employeeId, postingData });
    return data;
  }
  async recordAttachment(attachmentData: any) {
    const { data } = await apiClient.post('/attachments', attachmentData);
    return data;
  }
  async endAttachment(attachmentId: string, effectiveTo?: Date) {
    const { data } = await apiClient.patch(`/attachments/${attachmentId}/end`, { effectiveTo });
    return data;
  }

  async createOffice(officeData: any): Promise<Office> {
    const { data } = await apiClient.post('/offices', officeData);
    return data;
  }

  async updateOffice(id: string, officeData: any): Promise<Office> {
    const { data } = await apiClient.put(`/offices/${id}`, officeData);
    return data;
  }

  async createPosition(officeId: string, positionData: any): Promise<any> {
    const { data } = await apiClient.post(`/offices/${officeId}/positions`, positionData);
    return data;
  }

  async updatePosition(officeId: string, positionId: string, positionData: any): Promise<any> {
    const { data } = await apiClient.put(`/offices/${officeId}/positions/${positionId}`, positionData);
    return data;
  }

  async deletePosition(officeId: string, positionId: string): Promise<void> {
    await apiClient.delete(`/offices/${officeId}/positions/${positionId}`);
  }

  async getRoles() {
    const { data } = await apiClient.get('/roles');
    return data;
  }

  async createRole(roleData: { name: string; permissions: string[] }) {
    const { data } = await apiClient.post('/roles', roleData);
    return data;
  }

  async updateRole(id: string, roleData: { name?: string; permissions?: string[] }) {
    const { data } = await apiClient.put(`/roles/${id}`, roleData);
    return data;
  }

  async deleteRole(id: string) {
    const { data } = await apiClient.delete(`/roles/${id}`);
    return data;
  }

  async getUsers() {
    const { data } = await apiClient.get('/users');
    return data;
  }

  async createUser(userData: any) {
    const { data } = await apiClient.post('/users', userData);
    return data;
  }

  async updateUser(id: string, userData: any) {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    return data;
  }

  async deleteUser(id: string) {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  }
}

export const apiService = new ApiService();
