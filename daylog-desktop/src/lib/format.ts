export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0分钟";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}分钟`;
  if (rest === 0) return `${hours}小时`;
  return `${hours}小时${rest}分钟`;
}

export function formatDateZh(date: string): string {
  const value = new Date(`${date}T00:00:00`);
  return `${value.getMonth() + 1}月${value.getDate()}日`;
}

export function weekdayZh(date: string): string {
  const value = new Date(`${date}T00:00:00`);
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][value.getDay()];
}
