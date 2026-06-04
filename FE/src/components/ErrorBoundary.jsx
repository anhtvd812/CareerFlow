import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">Ứng dụng bị lỗi khi render</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Không phải trang trắng nữa</h1>
            <p className="mt-3 text-sm text-slate-600">
              Mở DevTools Console để xem chi tiết. Lỗi gần nhất:
            </p>
            <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-white">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
