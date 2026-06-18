import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository.js';
import { EmployeeModel } from '../models/EmployeeModel.js';
import { PostingModel } from '../models/PostingModel.js';
import { AttachmentModel } from '../models/AttachmentModel.js';
import { OfficeModel } from '../models/OfficeModel.js';
import { Employee } from '../../../domain/entities/Employee.js';

export class EmployeeRepository extends IEmployeeRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Employee.create({
      id: doc.id,
      name: doc.name,
      fatherName: doc.fatherName,
      cnic: doc.cnic,
      dob: doc.dob,
      dateOfJoining: doc.dateOfJoining,
      basicScale: doc.basicScale,
      contactNumber: doc.contactNumber,
      photoUrl: doc.photoUrl,
      status: doc.status
    });
  }

  async findAll(filters = {}) {
    let query = {};

    if (filters.search) {
      const regex = { $regex: filters.search, $options: 'i' };
      query.$or = [{ name: regex }, { cnic: regex }, { fatherName: regex }];
    }
    
    if (filters.basicScale) {
      query.basicScale = filters.basicScale;
    }

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    let employeeIdsSet = null;

    const intersectIds = (ids) => {
      if (employeeIdsSet === null) {
        employeeIdsSet = new Set(ids);
      } else {
        employeeIdsSet = new Set(ids.filter(id => employeeIdsSet.has(id)));
      }
    };

    if (filters.officeId) {
      const postings = await PostingModel.find({ officeId: filters.officeId, effectiveTo: null }).lean();
      intersectIds(postings.map(p => p.employeeId));
    }

    if (filters.attachedTo) {
      const attachments = await AttachmentModel.find({ officeId: filters.attachedTo, effectiveTo: null }).lean();
      intersectIds(attachments.map(a => a.employeeId));
    }

    if (filters.district) {
      const offices = await OfficeModel.find({ district: filters.district }).lean();
      const officeIds = offices.map(o => o.id);
      const postings = await PostingModel.find({ officeId: { $in: officeIds }, effectiveTo: null }).lean();
      intersectIds(postings.map(p => p.employeeId));
    }

    if (employeeIdsSet !== null) {
      query.id = { $in: Array.from(employeeIdsSet) };
    }

    const docs = await EmployeeModel.find(query).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findById(id) {
    const doc = await EmployeeModel.findOne({ id }).lean();
    return this._mapToDomain(doc);
  }

  async save(employee) {
    const doc = new EmployeeModel(employee);
    await doc.save();
    return this._mapToDomain(doc.toObject());
  }

  async update(id, data) {
    const doc = await EmployeeModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return this._mapToDomain(doc);
  }

  async delete(id) {
    await EmployeeModel.findOneAndDelete({ id });
    await PostingModel.deleteMany({ employeeId: id });
    await AttachmentModel.deleteMany({ employeeId: id });
    return true;
  }
}
