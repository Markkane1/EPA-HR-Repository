import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl text-gray-900 mb-6 font-normal">Welcome Back!</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-[#e74a3b] text-white p-4 rounded-md mb-6 flex items-center" role="alert">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      <form className="user" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            {...register('email')}
            className={`w-full h-12 px-4 py-3 text-[0.8rem] rounded-full border border-[#d1d3e2] focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] outline-none transition-all ${errors.email ? 'border-[#e74a3b] focus:border-[#e74a3b] focus:ring-[rgba(231,74,59,0.25)]' : ''}`}
            id="inputEmail"
            placeholder="Email Address — e.g. admin@epa.punjab.gov.pk"
          />
          {errors.email && (
            <div className="text-[#e74a3b] text-sm mt-1 ml-4">{errors.email.message}</div>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <input
            type="password"
            {...register('password')}
            className={`w-full h-12 px-4 py-3 text-[0.8rem] rounded-full border border-[#d1d3e2] focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] outline-none transition-all ${errors.password ? 'border-[#e74a3b] focus:border-[#e74a3b] focus:ring-[rgba(231,74,59,0.25)]' : ''}`}
            id="inputPassword"
            placeholder="Password"
          />
          {errors.password && (
            <div className="text-[#e74a3b] text-sm mt-1 ml-4">{errors.password.message}</div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#4e73df] text-white text-[0.8rem] font-bold rounded-full hover:bg-[#2e59d9] transition-colors flex items-center justify-center outline-none"
        >
          {loading ? (
            <>
              <span
                className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                role="status"
                aria-hidden="true"
              ></span>
              Signing In…
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </>
          )}
        </button>
      </form>

      <hr className="my-6 border-[#e3e6f0]" />
      <div className="text-center">
        <small className="text-[#858796]">
          Government of Punjab — EPA Personnel Repository
        </small>
      </div>
    </>
  );
};
