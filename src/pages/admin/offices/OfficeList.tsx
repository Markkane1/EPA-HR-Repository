import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, MapPin, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/components/Button';
import { Input } from '../../../ui/components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../ui/components/Table';
import { usePersonnelAppState } from '../../../ui/hooks/usePersonnelAppState';

export function OfficeList() {
  const navigate = useNavigate();
  const { offices } = usePersonnelAppState();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOffices = offices.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Office Register</h1>
          <p className="text-sm text-slate-500 mt-1">Manage EPA regional offices and directorates</p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/offices/new')}
        >
          Add New Office
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <Input 
            placeholder="Search offices by name or location..." 
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Office Details</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOffices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <Building2 className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-lg font-bold text-slate-700">No offices found</p>
                  <p className="text-sm">Try adjusting your search or add a new office.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredOffices.map((office) => (
              <TableRow key={office.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{office.name}</p>
                      <p className="text-xs text-slate-500 font-mono">ID: {office.id.split('-')[0]}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {office.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {office.location}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2"
                      onClick={() => navigate(`/admin/offices/${office.id}`)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
