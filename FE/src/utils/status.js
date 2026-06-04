export const statusLabels = {
  completed: 'Hoàn thành',
  in_progress: 'Đang làm',
  not_started: 'Chưa làm',
};

export const statusClasses = {
  completed: 'bg-mint-100 text-mint-600',
  in_progress: 'bg-amber-100 text-amber-700',
  not_started: 'bg-slate-100 text-slate-600',
};

export const normalizeStatus = (status) => status || 'not_started';
