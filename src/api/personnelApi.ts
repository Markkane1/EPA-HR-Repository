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

  return response.json();
};

export const getOffices = () => apiRequest('/api/offices');
export const getPositions = () => apiRequest('/api/positions');
export const getSeats = () => apiRequest('/api/seats');
export const getEmployees = () => apiRequest('/api/employees');
export const getPostings = () => apiRequest('/api/postings');
export const getAttachments = () => apiRequest('/api/attachments');

export const createOffice = (payload: object) => apiRequest('/api/offices', { method: 'POST', body: JSON.stringify(payload) });
export const createPosition = (payload: object) => apiRequest('/api/positions', { method: 'POST', body: JSON.stringify(payload) });
export const createSeat = (payload: object) => apiRequest('/api/seats', { method: 'POST', body: JSON.stringify(payload) });
export const createEmployee = (payload: object) => apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(payload) });
export const createPosting = (payload: object) => apiRequest('/api/postings', { method: 'POST', body: JSON.stringify(payload) });
export const createAttachment = (payload: object) => apiRequest('/api/attachments', { method: 'POST', body: JSON.stringify(payload) });
export const updateEmployee = (id: string, payload: object) => apiRequest(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const updatePosting = (id: string, payload: object) => apiRequest(`/api/postings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const updateAttachment = (id: string, payload: object) => apiRequest(`/api/attachments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
