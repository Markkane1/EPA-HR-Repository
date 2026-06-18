import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Building2, MapPin } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/Card';

const officeSchema = z.object({
  name: z.string().min(3, 'Office name must be at least 3 characters'),
  type: z.enum(['Headquarters', 'Regional', 'District', 'Laboratory']),
  location: z.string().min(2, 'Location is required'),
});

type OfficeForm = z.infer<typeof officeSchema>;

export function OfficeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Removed legacy hook dependency
  const isNew = id === 'new';
  const existingOffice = null; // Decoupled from legacy mockData

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OfficeForm>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      name: '',
      type: 'Regional',
      location: '',
    }
  });

  useEffect(() => {
    if (existingOffice) {
      reset({
        name: existingOffice.name,
        type: existingOffice.type as any,
        location: existingOffice.location,
      });
    }
  }, [existingOffice, reset]);

  const onSubmit = async (data: OfficeForm) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API network delay
    
    if (isNew) {
      console.log('Create office API call', data);
    } else {
      console.log('Update office API call', id, data);
    }
    
    navigate('/admin/offices');
  };

  if (!isNew && !existingOffice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Office Not Found</h2>
        <Button variant="ghost" onClick={() => navigate('/admin/offices')} className="mt-4">
          Return to Register
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 hover:bg-slate-200" 
          onClick={() => navigate('/admin/offices')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isNew ? 'Create New Office' : 'Edit Office Details'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isNew ? 'Register a new EPA facility' : `Updating records for ${existingOffice?.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Facility Information</CardTitle>
            <CardDescription>Enter the official details for this location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Office Name"
              placeholder="e.g. EPA Regional Office Lahore"
              leftIcon={<Building2 className="w-4 h-4" />}
              {...register('name')}
              error={errors.name?.message}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Office Type
                </label>
                <select 
                  className={`
                    w-full bg-white border border-slate-200 rounded-xl text-sm transition-all duration-200 outline-none
                    py-2.5 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900
                  `}
                  {...register('type')}
                >
                  <option value="Headquarters">Headquarters</option>
                  <option value="Regional">Regional Office</option>
                  <option value="District">District Office</option>
                  <option value="Laboratory">Laboratory</option>
                </select>
                {errors.type && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.type.message}</p>}
              </div>

              <Input
                label="Location / City"
                placeholder="e.g. Lahore, Punjab"
                leftIcon={<MapPin className="w-4 h-4" />}
                {...register('location')}
                error={errors.location?.message}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/offices')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isSubmitting}
            >
              {isNew ? 'Create Office' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
