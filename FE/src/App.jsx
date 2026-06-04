import React, { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import MentorChat from './pages/MentorChat';
import Profile from './pages/Profile';
import Roadmap from './pages/Roadmap';

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem('authToken')));
  const isAuthed = useMemo(() => authed, [authed]);

  return (
    <ErrorBoundary>
      {isAuthed ? (
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="lg:pl-72">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/mentor-chat" element={<MentorChat />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setAuthed(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ErrorBoundary>
  );
}
