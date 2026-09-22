import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
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

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsSubmitted(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Tên người dùng</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: nguyenvana" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="vd: email@gmail.com" required />
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
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="••••••••" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-background text-foreground" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary-deep transition shadow-lg shadow-primary/20 mt-2">
          Đăng ký tài khoản
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase font-medium">Hoặc đăng ký nhanh</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button type="button" onClick={() => alert("Đăng nhập Google")} className="w-full mt-2 flex items-center justify-center gap-3 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition shadow-sm">
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