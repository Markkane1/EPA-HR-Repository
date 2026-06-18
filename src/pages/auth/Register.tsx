import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../../ui/components/Button';
import { Input } from '../../ui/components/Input';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    console.log('Register attempt', data);
    // TODO: Connect to actual Auth API
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/login'); // Redirect to login on successful registration
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Request Access</h2>
        <p className="text-sm text-slate-500">Create an account for the portal</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          leftIcon={<User className="w-4 h-4" />}
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <Input
          label="Official Email"
          type="email"
          placeholder="officer@epa.punjab.gov.pk"
          leftIcon={<Mail className="w-4 h-4" />}
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            isLoading={isSubmitting}
          >
            Submit Request
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
          Sign In instead
        </Link>
      </div>
    </div>
  );
}
