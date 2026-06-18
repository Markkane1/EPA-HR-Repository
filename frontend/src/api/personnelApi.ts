/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const apiRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data as T;
};

export const getOffices = () => apiRequest<import('../domain/entities').Office[]>('/api/offices');
export const getPositions = () => apiRequest<import('../domain/entities').Position[]>('/api/positions');
export const getSeats = () => apiRequest<import('../domain/entities').Seat[]>('/api/seats');
export const getEmployees = () => apiRequest<import('../domain/entities').Employee[]>('/api/employees');
export const getPostings = () => apiRequest<import('../domain/entities').Posting[]>('/api/postings');
export const getAttachments = () => apiRequest<import('../domain/entities').Attachment[]>('/api/attachments');

export const createOffice = (payload: object) => apiRequest<import('../domain/entities').Office>('/api/offices', { method: 'POST', body: JSON.stringify(payload) });
export const createPosition = (payload: object) => apiRequest<import('../domain/entities').Position>('/api/positions', { method: 'POST', body: JSON.stringify(payload) });
export const createSeat = (payload: object) => apiRequest<import('../domain/entities').Seat>('/api/seats', { method: 'POST', body: JSON.stringify(payload) });
export const createEmployee = (payload: object) => apiRequest<import('../domain/entities').Employee>('/api/employees', { method: 'POST', body: JSON.stringify(payload) });
export const createPosting = (payload: object) => apiRequest<import('../domain/entities').Posting>('/api/postings', { method: 'POST', body: JSON.stringify(payload) });
export const createAttachment = (payload: object) => apiRequest<import('../domain/entities').Attachment>('/api/attachments', { method: 'POST', body: JSON.stringify(payload) });
export const updateEmployee = (id: string, payload: object) => apiRequest<import('../domain/entities').Employee>(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const updatePosting = (id: string, payload: object) => apiRequest<import('../domain/entities').Posting>(`/api/postings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const updateAttachment = (id: string, payload: object) => apiRequest<import('../domain/entities').Attachment>(`/api/attachments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
