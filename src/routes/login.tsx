import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Đăng nhập:", { identifier, password });
    alert("Đăng nhập thành công!");
  };

  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập vào tài khoản LearnFast của bạn">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-foreground">Tên người dùng hoặc Email</label>
          <input 
            type="text" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-background text-foreground"
            placeholder="Nhập username hoặc email"
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
            required 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary-deep transition shadow-lg shadow-primary/20"
        >
          Đăng nhập
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
          onClick={() => alert("Đăng nhập Google")} 
          className="w-full mt-2 flex items-center justify-center gap-3 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition shadow-sm"
        >
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