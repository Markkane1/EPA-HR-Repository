import { Office, Position, Seat, Employee, Posting, Attachment } from './domain/entities';

export const initialOffices: Office[] = [
  {
    id: 'off-1',
    name: 'EPA Head Office (Directorate of Environmental Impact Assessment)',
    type: 'Directorate',
    location: 'Lytton Road, Lahore',
    district: 'Lahore'
  },
  {
    id: 'off-2',
    name: 'EPA Regional Office (North Region)',
    type: 'Regional',
    location: 'Chaklala Scheme III, Rawalpindi',
    district: 'Rawalpindi'
  },
  {
    id: 'off-3',
    name: 'EPA Field Office (Industrial Sector)',
    type: 'Field Office',
    location: 'Sialkot Road, Gujranwala',
    district: 'Gujranwala'
  }
];

export const initialPositions: Position[] = [
  // Directorate (off-1)
  {
    id: 'pos-1-1',
    officeId: 'off-1',
    title: 'Director EIA',
    scale: 'BS-19',
    allocatedSeatsCount: 1
  },
  {
    id: 'pos-1-2',
    officeId: 'off-1',
    title: 'Deputy Director (EIA Audit)',
    scale: 'BS-18',
    allocatedSeatsCount: 2
  },
  {
    id: 'pos-1-3',
    officeId: 'off-1',
    title: 'Assistant Director (EIA)',
    scale: 'BS-17',
    allocatedSeatsCount: 3
  },
  {
    id: 'pos-1-4',
    officeId: 'off-1',
    title: 'Environmental Inspector',
    scale: 'BS-16',
    allocatedSeatsCount: 2
  },

  // Regional (off-2)
  {
    id: 'pos-2-1',
    officeId: 'off-2',
    title: 'Regional Directorate Head',
    scale: 'BS-19',
    allocatedSeatsCount: 1
  },
  {
    id: 'pos-2-2',
    officeId: 'off-2',
    title: 'Assistant Director (Labs)',
    scale: 'BS-17',
    allocatedSeatsCount: 1
  },
  {
    id: 'pos-2-3',
    officeId: 'off-2',
    title: 'Environmental Inspector',
    scale: 'BS-16',
    allocatedSeatsCount: 3
  },

  // Field Office (off-3)
  {
    id: 'pos-3-1',
    officeId: 'off-3',
    title: 'District Officer (Environment)',
    scale: 'BS-18',
    allocatedSeatsCount: 1
  },
  {
    id: 'pos-3-2',
    officeId: 'off-3',
    title: 'Assistant Director (Field)',
    scale: 'BS-17',
    allocatedSeatsCount: 2
  },
  {
    id: 'pos-3-3',
    officeId: 'off-3',
    title: 'Environmental Inspector',
    scale: 'BS-16',
    allocatedSeatsCount: 3
  }
];

export const initialSeats: Seat[] = [
  // Directorate Seats
  { id: 'seat-1-1-1', positionId: 'pos-1-1', name: 'Director Seat - A' },
  { id: 'seat-1-2-1', positionId: 'pos-1-2', name: 'Deputy Director Seat - A' },
  { id: 'seat-1-2-2', positionId: 'pos-1-2', name: 'Deputy Director Seat - B' },
  { id: 'seat-1-3-1', positionId: 'pos-1-3', name: 'Assistant Director Seat - A' },
  { id: 'seat-1-3-2', positionId: 'pos-1-3', name: 'Assistant Director Seat - B' },
  { id: 'seat-1-3-3', positionId: 'pos-1-3', name: 'Assistant Director Seat - C' },
  { id: 'seat-1-4-1', positionId: 'pos-1-4', name: 'Inspector Seat - A' },
  { id: 'seat-1-4-2', positionId: 'pos-1-4', name: 'Inspector Seat - B' },

  // Regional Seats (off-2)
  { id: 'seat-2-1-1', positionId: 'pos-2-1', name: 'Regional Director Seat - A' },
  { id: 'seat-2-2-1', positionId: 'pos-2-2', name: 'Lab Incharge Seat - A' },
  { id: 'seat-2-3-1', positionId: 'pos-2-3', name: 'Inspector Seat - A' },
  { id: 'seat-2-3-2', positionId: 'pos-2-3', name: 'Inspector Seat - B' },
  { id: 'seat-2-3-3', positionId: 'pos-2-3', name: 'Inspector Seat - C' },

  // Field Office Seats (off-3)
  { id: 'seat-3-1-1', positionId: 'pos-3-1', name: 'District Officer Seat - A' },
  { id: 'seat-3-2-1', positionId: 'pos-3-2', name: 'Assistant Director Field Seat - A' },
  { id: 'seat-3-2-2', positionId: 'pos-3-2', name: 'Assistant Director Field Seat - B' },
  { id: 'seat-3-3-1', positionId: 'pos-3-3', name: 'Inspector Seat - A' },
  { id: 'seat-3-3-2', positionId: 'pos-3-3', name: 'Inspector Seat - B' },
  { id: 'seat-3-3-3', positionId: 'pos-3-3', name: 'Inspector Seat - C' }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Muhammad Asif',
    fatherName: 'Tariq Mahmood',
    cnic: '35201-1823901-3',
    dob: '1980-04-12',
    doj: '2010-02-15',
    scale: 'BS-19',
    contactNumber: '0300-1234567',
    photoColor: 'bg-emerald-600',
    status: 'active'
  },
  {
    id: 'emp-2',
    name: 'Sajid Ali Khan',
    fatherName: 'Liaqat Ali Khan',
    cnic: '34101-7890123-5',
    dob: '1985-08-22',
    doj: '2012-05-18',
    scale: 'BS-18',
    contactNumber: '0321-4567890',
    photoColor: 'bg-indigo-600',
    status: 'active'
  },
  {
    id: 'emp-3',
    name: 'Ayesha Rehman',
    fatherName: 'Abdul Rehman',
    cnic: '37405-1234567-8',
    dob: '1990-11-05',
    doj: '2016-10-10',
    scale: 'BS-17',
    contactNumber: '0333-7890123',
    photoColor: 'bg-rose-600',
    status: 'active'
  },
  {
    id: 'emp-4',
    name: 'Zainab Bibi',
    fatherName: 'Muhammad Shafiq',
    cnic: '35202-4567890-2',
    dob: '1992-01-30',
    doj: '2017-03-22',
    scale: 'BS-17',
    contactNumber: '0301-2345678',
    photoColor: 'bg-amber-600',
    status: 'active'
  },
  {
    id: 'emp-5',
    name: 'Hamza Khalid',
    fatherName: 'Khalid Farooq',
    cnic: '35201-8901234-7',
    dob: '1994-06-15',
    doj: '2019-09-01',
    scale: 'BS-16',
    contactNumber: '0312-3456789',
    photoColor: 'bg-violet-600',
    status: 'active'
  },
  {
    id: 'emp-6',
    name: 'Bilal Ahmed Shaheen',
    fatherName: 'Nazir Ahmed',
    cnic: '34101-4567890-1',
    dob: '1983-03-10',
    doj: '2014-01-12',
    scale: 'BS-18',
    contactNumber: '0345-6789012',
    photoColor: 'bg-teal-600',
    status: 'active'
  },
  {
    id: 'emp-7',
    name: 'Sana Malik',
    fatherName: 'Malik Tariq',
    cnic: '35201-2345678-4',
    dob: '1991-12-14',
    doj: '2016-08-20',
    scale: 'BS-16',
    contactNumber: '0322-1234901',
    photoColor: 'bg-fuchsia-600',
    status: 'active'
  },
  {
    id: 'emp-8',
    name: 'Tariq Mahmood Qureshi',
    fatherName: 'Bashir Ahmed Qureshi',
    cnic: '38403-1200456-9',
    dob: '1964-05-20',
    doj: '1992-06-11',
    scale: 'BS-19',
    contactNumber: '0300-4561239',
    photoColor: 'bg-slate-600',
    status: 'retired'
  },
  {
    id: 'emp-9',
    name: 'Usman Ghani',
    fatherName: 'Farooq Ghani',
    cnic: '33100-8912345-3',
    dob: '1993-02-28',
    doj: '2018-11-15',
    scale: 'BS-16',
    contactNumber: '0334-9087123',
    photoColor: 'bg-cyan-600',
    status: 'active'
  },
  {
    id: 'emp-10',
    name: 'Mariam Jameel',
    fatherName: 'Jameel Akhter',
    cnic: '35201-9012344-6',
    dob: '1995-10-18',
    doj: '2020-07-01',
    scale: 'BS-16',
    contactNumber: '0302-8765432',
    photoColor: 'bg-sky-600',
    status: 'active'
  }
];

export const initialPostings: Posting[] = [
  {
    id: 'post-1',
    employeeId: 'emp-1',
    seatId: 'seat-1-1-1',
    effectiveFrom: '2020-01-15',
    effectiveTo: null,
    orderNumber: 'SO(Estt)1-45/2020'
  },
  {
    id: 'post-2',
    employeeId: 'emp-2',
    seatId: 'seat-1-2-1',
    effectiveFrom: '2018-06-10',
    effectiveTo: null,
    orderNumber: 'EPA(EIA)PD-09/18'
  },
  // Active Posting for emp-3
  {
    id: 'post-3-past',
    employeeId: 'emp-3',
    seatId: 'seat-1-4-1', // was Inspector before
    effectiveFrom: '2016-10-10',
    effectiveTo: '2021-02-28',
    orderNumber: 'SO(Estt)4-12/2016'
  },
  {
    id: 'post-3-current',
    employeeId: 'emp-3',
    seatId: 'seat-1-3-1', // now Assistant Director
    effectiveFrom: '2021-03-01',
    effectiveTo: null,
    orderNumber: 'SO(Estt-II)5-90/2021'
  },
  {
    id: 'post-4',
    employeeId: 'emp-4',
    seatId: 'seat-2-2-1', // Lab Incharge Seat
    effectiveFrom: '2017-03-22',
    effectiveTo: null,
    orderNumber: 'SO(Estt)3-44/2017'
  },
  {
    id: 'post-5',
    employeeId: 'emp-5',
    seatId: 'seat-1-4-1', // Inspector Seat A Lahore
    effectiveFrom: '2019-09-01',
    effectiveTo: null,
    orderNumber: 'SO(Estt)8-11/2019'
  },
  {
    id: 'post-6',
    employeeId: 'emp-6',
    seatId: 'seat-3-1-1', // District Officer Gujranwala
    effectiveFrom: '2021-05-15',
    effectiveTo: null,
    orderNumber: 'SO(Estt)2-21/2021'
  },
  {
    id: 'post-7',
    employeeId: 'emp-7',
    seatId: 'seat-2-3-1', // Inspector Seat A Rawalpindi
    effectiveFrom: '2016-08-20',
    effectiveTo: null,
    orderNumber: 'EPA-ESTT-2101/16'
  },
  // Past posting of retired employee emp-8
  {
    id: 'post-8-past',
    employeeId: 'emp-8',
    seatId: 'seat-2-1-1', // Was Regional Director
    effectiveFrom: '2015-12-01',
    effectiveTo: '2024-05-19', // Retired on 2024-05-19
    orderNumber: 'SO(Estt)1-33/2015'
  },
  {
    id: 'post-9',
    employeeId: 'emp-9',
    seatId: 'seat-3-3-1', // Inspector Seat A Gujranwala
    effectiveFrom: '2018-11-15',
    effectiveTo: null,
    orderNumber: 'EPA-ESTT-90/18'
  },
  {
    id: 'post-10',
    employeeId: 'emp-10',
    seatId: 'seat-3-3-2', // Inspector Seat B Gujranwala
    effectiveFrom: '2020-07-01',
    effectiveTo: null,
    orderNumber: 'EPA-ESTT-07/20'
  }
];

export const initialAttachments: Attachment[] = [
  {
    id: 'attach-1',
    employeeId: 'emp-9', // Usman Ghani (Gujranwala home post)
    targetOfficeId: 'off-1', // temporarily attached to Head Office Lahore
    effectiveFrom: '2025-10-01',
    effectiveTo: null, // still active
    orderNumber: 'DG(EPA)SO-341/2025',
    reason: 'To assist the Directorate in Smog emergency monitoring operations and industrial audits in Lahore division.'
  },
  {
    id: 'attach-2',
    employeeId: 'emp-5', // Hamza Khalid
    targetOfficeId: 'off-2', // temporarily attached to Rawalpindi in past
    effectiveFrom: '2022-06-01',
    effectiveTo: '2022-08-31',
    orderNumber: 'DG(EPA)SO-12/2022',
    reason: 'To calibrate multi-gas analytical equipment and train the regional labs staff.'
  }
];
