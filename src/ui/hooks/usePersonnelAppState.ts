import { useEffect, useState } from 'react';
import {
  Office,
  Position,
  Seat,
  Employee,
  Posting,
  Attachment,
} from '../../domain/entities';
import {
  getOffices,
  getPositions,
  getSeats,
  getEmployees,
  getPostings,
  getAttachments,
  createOffice as apiCreateOffice,
  createPosition as apiCreatePosition,
  createSeat as apiCreateSeat,
  createEmployee as apiCreateEmployee,
  createPosting as apiCreatePosting,
  createAttachment as apiCreateAttachment,
  updateEmployee as apiUpdateEmployee,
  updatePosting as apiUpdatePosting,
  updateAttachment as apiUpdateAttachment,
} from '../../api/personnelApi';

export const usePersonnelAppState = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [officesData, positionsData, seatsData, employeesData, postingsData, attachmentsData] = await Promise.all([
        getOffices(),
        getPositions(),
        getSeats(),
        getEmployees(),
        getPostings(),
        getAttachments(),
      ]);

      setOffices(officesData);
      setPositions(positionsData);
      setSeats(seatsData);
      setEmployees(employeesData);
      setPostings(postingsData);
      setAttachments(attachmentsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching personnel data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleCreateOffice = async (newOffice: Omit<Office, 'id'>) => {
    await apiCreateOffice(newOffice);
    await refreshAll();
  };

  const handleCreatePositionAndSeats = async (
    officeId: string,
    title: string,
    scale: string,
    seatsCount: number
  ) => {
    const position = await apiCreatePosition({ officeId, title, scale, allocatedSeatsCount: seatsCount });
    const positionId = (position as any)._id || (position as any).id;

    const seatPromises = Array.from({ length: seatsCount }, (_, i) =>
      apiCreateSeat({
        positionId,
        name: seatsCount === 1 ? 'Designated Seat' : `Seat - ${String.fromCharCode(65 + i)}`,
      })
    );

    await Promise.all(seatPromises);
    await refreshAll();
  };

  const handleTransferEmployee = async (
    employeeId: string,
    targetSeatId: string,
    effectiveDate: string,
    orderNumber: string,
    remarks?: string
  ) => {
    const activePost = postings.find((post) => post.employeeId === employeeId && post.effectiveTo === null);

    if (activePost) {
      await apiUpdatePosting((activePost as any)._id || (activePost as any).id, {
        ...activePost,
        effectiveTo: effectiveDate,
      });
    }

    await apiCreatePosting({
      employeeId,
      seatId: targetSeatId,
      effectiveFrom: effectiveDate,
      effectiveTo: null,
      orderNumber,
      remarks,
    });

    await apiUpdateEmployee(employeeId, { status: 'active' });
    await refreshAll();
  };

  const handleAttachEmployee = async (
    employeeId: string,
    targetOfficeId: string,
    effectiveFrom: string,
    orderNumber: string,
    reason: string,
    effectiveTo?: string | null
  ) => {
    await apiCreateAttachment({
      employeeId,
      targetOfficeId,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      orderNumber,
      reason,
    });

    await refreshAll();
  };

  const handleEndAttachment = async (attachmentId: string, effectiveTo: string) => {
    const currentAttachment = attachments.find((attachment) => attachment.id === attachmentId || (attachment as any)._id === attachmentId);
    if (!currentAttachment) throw new Error('Attachment not found');

    const id = (currentAttachment as any)._id || currentAttachment.id;
    await apiUpdateAttachment(id, { ...currentAttachment, effectiveTo });
    await refreshAll();
  };

  const handleOnboardEmployee = async (
    employee: Omit<Employee, 'id'>,
    initialSeatId: string | null,
    orderNumber: string,
    effectiveFrom?: string
  ) => {
    const createdEmployee = await apiCreateEmployee(employee);
    const employeeId = (createdEmployee as any)._id || (createdEmployee as any).id;

    if (initialSeatId) {
      await apiCreatePosting({
        employeeId,
        seatId: initialSeatId,
        effectiveFrom: effectiveFrom || employee.doj,
        effectiveTo: null,
        orderNumber,
      });
    }

    await refreshAll();
  };

  const handleRetireEmployee = async (employeeId: string, retireDate: string, orderNumber: string) => {
    const activePost = postings.find((post) => post.employeeId === employeeId && post.effectiveTo === null);
    if (activePost) {
      await apiUpdatePosting((activePost as any)._id || (activePost as any).id, {
        ...activePost,
        effectiveTo: retireDate,
      });
    }

    const activeAttachments = attachments.filter((attachment) => attachment.employeeId === employeeId && attachment.effectiveTo === null);
    await Promise.all(
      activeAttachments.map((attachment) => {
        const id = (attachment as any)._id || attachment.id;
        return apiUpdateAttachment(id, { ...attachment, effectiveTo: retireDate });
      })
    );

    await apiUpdateEmployee(employeeId, { status: 'retired' });
    await refreshAll();
  };

  return {
    offices,
    positions,
    seats,
    employees,
    postings,
    attachments,
    loading,
    error,
    refreshAll,
    handleCreateOffice,
    handleCreatePositionAndSeats,
    handleTransferEmployee,
    handleAttachEmployee,
    handleEndAttachment,
    handleOnboardEmployee,
    handleRetireEmployee,
  };
};
