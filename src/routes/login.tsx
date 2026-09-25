import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { login } from '@/lib/auth';
import { supabase } from '@/intergrations/supabase/client';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Đăng nhập Google qua Supabase OAuth (tạo phiên đăng nhập thật sự)
  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ identifier, password });
      navigate({ to: '/' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập vào tài khoản LearnFast của bạn">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-semibold text-foreground">Tên người dùng hoặc Email</label>
          <input 
            type="text" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-background text-foreground"
            placeholder="Nhập username hoặc email"
            autoComplete="username"
            required 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-foreground">Mật khẩu</label>
            <a href="#" className="text-xs text-primary hover:underline font-medium">Quên mật khẩu?</a>
          </div>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-background text-foreground"
            placeholder="••••••••"
            autoComplete="current-password"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary-deep transition shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-medium">Hoặc</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button 
          type="button" 
          onClick={() => void handleGoogleLogin()} 
          className="w-full mt-2 flex items-center justify-center gap-3 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Đăng nhập với Google
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthShell>
  );
}