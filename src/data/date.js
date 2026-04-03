export function getTodayKey() {
  const now = new Date();
  const bd = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return bd.toISOString().split('T')[0];
}

export function formatDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00+06:00');
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function daysUntil(dateStr) {
  const today = getTodayKey();
  const diff = new Date(dateStr).getTime() - new Date(today).getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `In ${days} days`;
}

export function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
}