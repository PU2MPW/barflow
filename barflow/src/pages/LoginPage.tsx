import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast.error('Credenciais inválidas');
      setIsLoading(false);
    } else {
      toast.success('Bem-vindo!');
      navigate('/pdv');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bar-dark to-bar-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BarFlow</h1>
          <p className="text-gray-400">Sistema de Gestão para Bares e Restaurantes</p>
        </div>

        <div className="bg-bar-darker border border-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Entrar</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-bar-dark border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Senha</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bar-dark border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Contas demo:</p>
            <p className="text-xs text-gray-500">admin@barflow.com / admin123</p>
            <p className="text-xs text-gray-500">gerente@barflow.com / gerente123</p>
            <p className="text-xs text-gray-500">garcom@barflow.com / garcom123</p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-400">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}