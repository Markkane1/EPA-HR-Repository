import { useEffect, useState } from 'react';
import {
  PersonnelState,
  Office,
  Position,
  Seat,
  Employee,
  Posting,
  Attachment,
} from '../../domain/entities';
import {
  buildInitialPersonnelState,
  createOffice,
  createPositionAndSeats,
  transferEmployee,
  attachEmployee,
  endAttachment,
  onboardEmployee,
  retireEmployee,
  restoreFactoryState,
} from '../../useCases/personnelUseCases';
import {
  saveStateToLocalStorage,
  clearLocalStorageState,
} from '../../data/persistence';

export const usePersonnelAppState = () => {
  const [state, setState] = useState<PersonnelState>(() => buildInitialPersonnelState());

  useEffect(() => {
    const initialState = buildInitialPersonnelState();
    setState(initialState);
  }, []);

  const persistState = (nextState: PersonnelState) => {
    setState(nextState);
    saveStateToLocalStorage(nextState);
  };

  const handleCreateOffice = (newOffice: Omit<Office, 'id'>) => {
    persistState(createOffice(state, newOffice));
  };

  const handleCreatePositionAndSeats = (
    officeId: string,
    title: string,
    scale: string,
    seatsCount: number
  ) => {
    persistState(createPositionAndSeats(state, officeId, title, scale, seatsCount));
  };

  const handleTransferEmployee = (
    employeeId: string,
    targetSeatId: string,
    effectiveDate: string,
    orderNumber: string,
    remarks?: string
  ) => {
    persistState(transferEmployee(state, employeeId, targetSeatId, effectiveDate, orderNumber, remarks));
  };

  const handleAttachEmployee = (
    employeeId: string,
    targetOfficeId: string,
    effectiveFrom: string,
    orderNumber: string,
    reason: string,
    effectiveTo?: string | null
  ) => {
    persistState(attachEmployee(state, employeeId, targetOfficeId, effectiveFrom, orderNumber, reason, effectiveTo));
  };

  const handleEndAttachment = (attachmentId: string, effectiveTo: string) => {
    persistState(endAttachment(state, attachmentId, effectiveTo));
  };

  const handleOnboardEmployee = (
    employee: Omit<Employee, 'id'>,
    initialSeatId: string | null,
    orderNumber: string,
    effectiveFrom?: string
  ) => {
    persistState(onboardEmployee(state, employee, initialSeatId, orderNumber, effectiveFrom));
  };

  const handleRetireEmployee = (employeeId: string, retireDate: string, orderNumber: string) => {
    persistState(retireEmployee(state, employeeId, retireDate, orderNumber));
  };

  const handleRestoreFactoryData = () => {
    clearLocalStorageState();
    const factoryState = restoreFactoryState();
    setState(factoryState);
  };

  return {
    ...state,
    handleCreateOffice,
    handleCreatePositionAndSeats,
    handleTransferEmployee,
    handleAttachEmployee,
    handleEndAttachment,
    handleOnboardEmployee,
    handleRetireEmployee,
    handleRestoreFactoryData,
  };
};
