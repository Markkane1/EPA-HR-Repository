import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-form'; // Wait, I installed react-hook-form.
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../../ui/components/Button';
import { Input } from '../../ui/components/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useReactHookForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('Login attempt', data);
    // TODO: Connect to your actual Auth API here
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/admin'); // Redirect to dashboard on success
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-sm text-slate-500">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
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

        <div className="flex items-center justify-between text-sm mt-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300 text-blue-950 focus:ring-blue-950" />
            <span className="text-slate-600 font-medium">Remember me</span>
          </label>
          <a href="#" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
            Forgot password?
          </a>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          size="lg" 
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold hover:underline">
          Request Access
        </Link>
      </div>
    </div>
  );
}
