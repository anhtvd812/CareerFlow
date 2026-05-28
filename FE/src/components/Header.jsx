import React from 'react';
import { Bell, Search } from 'lucide-react';
import { user } from '../data/mockData';

export default function Header() {
  return (
    <header className="hidden border-b border-slate-200 bg-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Xin chào, {user.name}</p>
          <h1 className="text-xl font-bold text-slate-950">Hồ sơ học tập cá nhân</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Tìm kỹ năng, task, mentor..." />
          </div>
          <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100" aria-label="Thông báo">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
