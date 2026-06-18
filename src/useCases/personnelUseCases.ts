import {
  PersonnelState,
  Office,
  Employee,
  Posting,
  Attachment,
} from '../domain/entities';
import {
  initialOffices,
  initialPositions,
  initialSeats,
  initialEmployees,
  initialPostings,
  initialAttachments,
} from '../data/mockData';
import { loadStateFromLocalStorage } from '../data/persistence';

export const buildInitialPersonnelState = (): PersonnelState => {
  const persisted = loadStateFromLocalStorage();

  return {
    offices: persisted?.offices?.length ? persisted.offices : initialOffices,
    positions: persisted?.positions?.length ? persisted.positions : initialPositions,
    seats: persisted?.seats?.length ? persisted.seats : initialSeats,
    employees: persisted?.employees?.length ? persisted.employees : initialEmployees,
    postings: persisted?.postings?.length ? persisted.postings : initialPostings,
    attachments: persisted?.attachments?.length ? persisted.attachments : initialAttachments,
  };
};

export const createOffice = (
  state: PersonnelState,
  newOffice: Omit<Office, 'id'>
): PersonnelState => {
  const office: Office = {
    ...newOffice,
    id: `off-${Date.now()}`,
  };

  return {
    ...state,
    offices: [...state.offices, office],
  };
};

export const createPositionAndSeats = (
  state: PersonnelState,
  officeId: string,
  title: string,
  scale: string,
  seatsCount: number
): PersonnelState => {
  const newPosId = `pos-${Date.now()}`;

  const position = {
    id: newPosId,
    officeId,
    title,
    scale,
    allocatedSeatsCount: seatsCount,
  };

  const seats = Array.from({ length: seatsCount }, (_, index) => ({
    id: `seat-${Date.now()}-${index + 1}`,
    positionId: newPosId,
    name: seatsCount === 1 ? 'Designated Seat' : `Seat - ${String.fromCharCode(65 + index)}`,
  }));

  return {
    ...state,
    positions: [...state.positions, position],
    seats: [...state.seats, ...seats],
  };
};

export const transferEmployee = (
  state: PersonnelState,
  employeeId: string,
  targetSeatId: string,
  effectiveDate: string,
  orderNumber: string,
  remarks?: string
): PersonnelState => {
  const updatedPostings = state.postings.map((posting) =>
    posting.employeeId === employeeId && posting.effectiveTo === null
      ? { ...posting, effectiveTo: effectiveDate }
      : posting
  );

  const newPosting: Posting = {
    id: `post-${Date.now()}`,
    employeeId,
    seatId: targetSeatId,
    effectiveFrom: effectiveDate,
    effectiveTo: null,
    orderNumber,
    remarks: remarks || undefined,
  };

  const updatedEmployees: Employee[] = state.employees.map((employee) =>
    employee.id === employeeId ? { ...employee, status: 'active' as const } : employee
  );

  return {
    ...state,
    postings: [...updatedPostings, newPosting],
    employees: updatedEmployees,
  };
};

export const attachEmployee = (
  state: PersonnelState,
  employeeId: string,
  targetOfficeId: string,
  effectiveFrom: string,
  orderNumber: string,
  reason: string,
  effectiveTo?: string | null
): PersonnelState => {
  const attachment: Attachment = {
    id: `attach-${Date.now()}`,
    employeeId,
    targetOfficeId,
    effectiveFrom,
    effectiveTo: effectiveTo || null,
    orderNumber,
    reason,
  };

  return {
    ...state,
    attachments: [...state.attachments, attachment],
  };
};

export const endAttachment = (
  state: PersonnelState,
  attachmentId: string,
  effectiveTo: string
): PersonnelState => ({
  ...state,
  attachments: state.attachments.map((attachment) =>
    attachment.id === attachmentId ? { ...attachment, effectiveTo } : attachment
  ),
});

export const onboardEmployee = (
  state: PersonnelState,
  employeeData: Omit<Employee, 'id'>,
  initialSeatId: string | null,
  orderNumber: string,
  effectiveFrom?: string
): PersonnelState => {
  const newEmployeeId = `emp-${Date.now()}`;
  const newEmployee: Employee = {
    id: newEmployeeId,
    ...employeeData,
  };

  const nextState: PersonnelState = {
    ...state,
    employees: [...state.employees, newEmployee],
  };

  if (!initialSeatId) {
    return nextState;
  }

  const posting: Posting = {
    id: `post-${Date.now()}`,
    employeeId: newEmployeeId,
    seatId: initialSeatId,
    effectiveFrom: effectiveFrom || employeeData.doj,
    effectiveTo: null,
    orderNumber: orderNumber || 'Initial Appointment Order',
  };

  return {
    ...nextState,
    postings: [...nextState.postings, posting],
  };
};

export const retireEmployee = (
  state: PersonnelState,
  employeeId: string,
  retireDate: string,
  orderNumber: string
): PersonnelState => {
  const updatedEmployees: Employee[] = state.employees.map((employee) =>
    employee.id === employeeId ? { ...employee, status: 'retired' as const } : employee
  );

  const updatedPostings = state.postings.map((posting) =>
    posting.employeeId === employeeId && posting.effectiveTo === null
      ? { ...posting, effectiveTo: retireDate }
      : posting
  );

  const updatedAttachments = state.attachments.map((attachment) =>
    attachment.employeeId === employeeId && attachment.effectiveTo === null
      ? { ...attachment, effectiveTo: retireDate }
      : attachment
  );

  return {
    ...state,
    employees: updatedEmployees,
    postings: updatedPostings,
    attachments: updatedAttachments,
  };
};

export const restoreFactoryState = (): PersonnelState => ({
  offices: initialOffices,
  positions: initialPositions,
  seats: initialSeats,
  employees: initialEmployees,
  postings: initialPostings,
  attachments: initialAttachments,
});
