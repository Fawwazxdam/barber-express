// src/utils/bookings.utils.ts
export function calculateEndTime(start: Date, duration: number) {
  return new Date(start.getTime() + duration * 60000);
}

export function isWithinOperatingHours(date: Date) {
  const hour = date.getHours();
  return hour >= 9 && hour < 21;
}

export function isBookingWithinSchedule(start: Date, end: Date, startTimeStr: string, endTimeStr: string): boolean {
  const startParts = (startTimeStr || "09:00").split(":").map(Number);
  const endParts = (endTimeStr || "21:00").split(":").map(Number);

  const startHour = startParts[0] ?? 9;
  const startMin = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 21;
  const endMin = endParts[1] ?? 0;

  const startVal = startHour * 60 + startMin;
  const endVal = endHour * 60 + endMin;

  const bookingStartVal = start.getHours() * 60 + start.getMinutes();
  const bookingEndVal = end.getHours() * 60 + end.getMinutes();

  return (
    bookingStartVal >= startVal &&
    bookingStartVal < endVal &&
    bookingEndVal > startVal &&
    bookingEndVal <= endVal
  );
}

export function generateTimeSlots(date: Date, startTimeStr = "09:00", endTimeStr = "21:00", slotMinutes = 30) {
  const slots: { start: Date; end: Date }[] = [];

  const startParts = (startTimeStr || "09:00").split(":").map(Number);
  const endParts = (endTimeStr || "21:00").split(":").map(Number);

  const startHour = startParts[0] ?? 9;
  const startMin = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 21;
  const endMin = endParts[1] ?? 0;

  const current = new Date(date);
  current.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + slotMinutes * 60000);

    const slotEndVal = slotEnd.getHours() * 60 + slotEnd.getMinutes();
    const endVal = endHour * 60 + endMin;
    if (slotEndVal > endVal) {
      break;
    }

    slots.push({ start: slotStart, end: slotEnd });
    current.setTime(slotEnd.getTime());
  }

  return slots;
}
