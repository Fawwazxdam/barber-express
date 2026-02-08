// src/utils/bookings.utils.ts
export function calculateEndTime(start: Date, duration: number) {
  return new Date(start.getTime() + duration * 60000);
}

export function isWithinOperatingHours(date: Date) {
  const hour = date.getHours();
  return hour >= 9 && hour < 21;
}

export function generateTimeSlots(date: Date, slotMinutes = 30) {
  const slots: { start: Date; end: Date }[] = [];

  const startHour = 9;
  const endHour = 21;

  const current = new Date(date);
  current.setHours(startHour, 0, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + slotMinutes * 60000);

    slots.push({ start: slotStart, end: slotEnd });
    current.setTime(slotEnd.getTime());
  }

  return slots;
}
