import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, ClipboardCheck, GraduationCap, Map, MessageCircle, UserRound } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/profile', label: 'Hồ sơ học tập', icon: UserRound },
  { to: '/roadmap', label: 'Lộ trình học tập', icon: Map },
  { to: '/assessment', label: 'Đánh giá ban đầu', icon: ClipboardCheck },
  { to: '/mentor-chat', label: 'Chat Mentor', icon: MessageCircle },
];

export default function Sidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-4 py-6 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </aside>
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur lg:hidden">
        <div className="mb-3 flex items-center gap-2 px-1">
          <GraduationCap className="h-6 w-6 text-brand-600" />
          <span className="text-sm font-bold text-slate-900">Learning Path</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
        <GraduationCap className="h-6 w-6" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-950">Smart Learning</p>
        <p className="text-xs font-medium text-slate-500">Personal profile & roadmap</p>
      </div>
    </div>
  );
}

function SidebarLink({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </NavLink>
  );
}
