import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { register } from '@/lib/auth';
import { useGoogleLogin } from '@react-oauth/google';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    school: '',
    class: '',
    dob: '',
    gender: 'Nam',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Xử lý xác thực Google khi đăng ký nhanh thành công
  const googleRegister = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Đăng ký/Đăng nhập Google thành công:", tokenResponse);
      // TODO: Gửi tokenResponse.access_token lên backend để tạo tài khoản mới nếu chưa tồn tại
      navigate({ to: '/' });
    },
    onError: () => {
      setError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        school: formData.school,
        className: formData.class,
        dob: formData.dob,
        gender: formData.gender,
        password: formData.password,
      });

      if (result.needsEmailConfirmation) {
        setIsSubmitted(true);
        return;
      }

      navigate({ to: '/' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthShell title="Kiểm tra email của bạn" subtitle="Xác thực tài khoản LearnFast">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✉️
          </div>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi liên kết xác nhận đến <span className="font-semibold text-foreground">{formData.email}</span>. Vui lòng kiểm tra hộp thư.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-card border border-border text-foreground py-3 rounded-xl font-semibold hover:bg-card/80 transition"
          >
            Quay lại
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Tạo tài khoản mới" subtitle="Đăng ký để bắt đầu hành trình học tập">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Tên người dùng</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: nguyenvana" autoComplete="username" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: email@gmail.com" autoComplete="email" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Trường</label>
            <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: THPT Chu Văn An" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Lớp</label>
            <input type="text" name="class" value={formData.class} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: 12A1" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Ngày sinh</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Giới tính</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Mật khẩu</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="••••••••" autoComplete="new-password" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="••••••••" autoComplete="new-password" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary-deep transition shadow-lg shadow-primary/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-medium">Hoặc đăng ký nhanh</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button 
          type="button" 
          onClick={() => googleRegister()} 
          className="w-full mt-2 flex items-center justify-center gap-3 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Tiếp tục với Google
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthShell>
  );
}