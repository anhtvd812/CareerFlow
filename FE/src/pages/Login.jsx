import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/authApi';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        await registerUser(name.trim(), email.trim(), password);
      }

      const result = await loginUser(email.trim(), password);
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('authUser', JSON.stringify(result.user));
      onLogin();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px]">
          <section className="hidden flex-col justify-center gap-4 lg:flex">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-600">CareerFlow</p>
            <h1 className="text-4xl font-bold text-slate-950">Bắt đầu hành trình học tập có mentor đồng hành</h1>
            <p className="text-base text-slate-500">
              Đăng nhập để làm bài đánh giá ban đầu, theo dõi lộ trình và nhận gợi ý phù hợp.
            </p>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isLogin ? 'Chào mừng bạn quay lại.' : 'Bắt đầu với email của bạn.'}
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-600"
                onClick={() => setMode(isLogin ? 'register' : 'login')}
              >
                {isLogin ? 'Đăng ký' : 'Đăng nhập'}
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {!isLogin ? (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Họ tên</label>
                  <input
                    className="input mt-2"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  className="input mt-2"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <input
                  className="input mt-2"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {error}
                </div>
              ) : null}

              <button className="btn-primary w-full" disabled={loading}>
                {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
