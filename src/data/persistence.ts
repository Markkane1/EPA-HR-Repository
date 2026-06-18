import { PersonnelState } from '../domain/entities';

const STORAGE_KEYS = {
  offices: 'epa_offices',
  positions: 'epa_positions',
  seats: 'epa_seats',
  employees: 'epa_employees',
  postings: 'epa_postings',
  attachments: 'epa_attachments',
};

const parseStoredArray = <T>(value: string | null): T[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadStateFromLocalStorage = (): PersonnelState | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return {
    offices: parseStoredArray(STORAGE_KEYS.offices),
    positions: parseStoredArray(STORAGE_KEYS.positions),
    seats: parseStoredArray(STORAGE_KEYS.seats),
    employees: parseStoredArray(STORAGE_KEYS.employees),
    postings: parseStoredArray(STORAGE_KEYS.postings),
    attachments: parseStoredArray(STORAGE_KEYS.attachments),
  };
};

export const saveStateToLocalStorage = (state: PersonnelState) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.offices, JSON.stringify(state.offices));
  window.localStorage.setItem(STORAGE_KEYS.positions, JSON.stringify(state.positions));
  window.localStorage.setItem(STORAGE_KEYS.seats, JSON.stringify(state.seats));
  window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(state.employees));
  window.localStorage.setItem(STORAGE_KEYS.postings, JSON.stringify(state.postings));
  window.localStorage.setItem(STORAGE_KEYS.attachments, JSON.stringify(state.attachments));
};

export const clearLocalStorageState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.offices);
  window.localStorage.removeItem(STORAGE_KEYS.positions);
  window.localStorage.removeItem(STORAGE_KEYS.seats);
  window.localStorage.removeItem(STORAGE_KEYS.employees);
  window.localStorage.removeItem(STORAGE_KEYS.postings);
  window.localStorage.removeItem(STORAGE_KEYS.attachments);
};
