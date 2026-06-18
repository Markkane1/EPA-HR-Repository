export class GetDashboardStats {
  constructor(employeeRepo, officeRepo, seatRepo, attachmentRepo, positionRepo) {
    this.employeeRepo = employeeRepo;
    this.officeRepo = officeRepo;
    this.seatRepo = seatRepo;
    this.attachmentRepo = attachmentRepo;
    this.positionRepo = positionRepo;
  }

  async execute() {
    const employees = await this.employeeRepo.findAll({});
    const offices = await this.officeRepo.findAll();
    
    let totalVacantSeats = 0;
    let officeStats = [];
    let currentlyAttachedCount = 0;
    let attachedEmployeesList = [];

    for (const office of offices) {
      const positions = await this.positionRepo.findByOffice(office.id);
      const totalSeats = positions.reduce((sum, p) => sum + p.totalSeats, 0);
      const vacantSeats = await this.seatRepo.findVacantByOffice(office.id);
      
      totalVacantSeats += vacantSeats.length;
      
      const attached = await this.attachmentRepo.findCurrentByOffice(office.id);
      currentlyAttachedCount += attached.length;

      for (const att of attached) {
        const emp = await this.employeeRepo.findById(att.employeeId);
        attachedEmployeesList.push({
          employee: emp,
          attachment: att,
          attachedToOffice: office
        });
      }

      officeStats.push({
        office,
        totalSeats,
        vacantSeats: vacantSeats.length,
        occupiedSeats: totalSeats - vacantSeats.length
      });
    }

    return {
      totalEmployees: employees.length,
      totalOffices: offices.length,
      totalVacantSeats,
      currentlyAttachedCount,
      allOffices: officeStats,
      attachedEmployeesList
    };
  }
}
