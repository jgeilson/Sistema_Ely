import React, { useState } from 'react';
import { Layers, Lock, User, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('auth_user', data.username);
        onLoginSuccess(data.username);
      } else {
        setError(data.message || 'Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      console.error('Erro de login:', err);
      setError('Ocorreu um erro ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header decoration */}
        <div className="bg-slate-900 px-6 py-8 text-center flex flex-col items-center relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 mb-3 border border-indigo-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Análise Socioeconômica</h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Usuário
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-semibold text-slate-700 disabled:bg-slate-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-semibold text-slate-700 disabled:bg-slate-50 transition-all"
                required
              />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Entrar no Sistema</span>
            )}
          </button>
        </form>

        {/* Footer info/warning */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            As credenciais do sistema são protegidas.
          </p>
        </div>
      </div>
    </div>
  );
}
