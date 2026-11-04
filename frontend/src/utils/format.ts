export const attendancePhotoPath = (attendanceId: number) =>
  `/attendances/${attendanceId}/photo`;

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatTime = (dateTime: string) =>
  new Date(dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const toISODate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date);

export const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
};

export const mapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;