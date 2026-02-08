// src/services/bookings.service.ts
import { BookingsRepository } from "../db/bookings.repository";
import { calculateEndTime, isWithinOperatingHours, generateTimeSlots } from "../utils/bookings.utils";

export const BookingsService = {
  async createBooking(dto: {
    barberId: string;
    serviceId: string;
    customerUserId?: string;
    customerName: string;
    customerPhone: string;
    customerNote?: string;
    bookingTime: string;
    duration: number;
  }) {
    const start = new Date(dto.bookingTime);
    const end = calculateEndTime(start, dto.duration);

    if (!isWithinOperatingHours(start) || !isWithinOperatingHours(end)) {
      return { status: 400, message: "Di luar jam operasional" };
    }

    const available = await BookingsRepository.isTimeSlotAvailable(dto.barberId, start, end);
    if (!available) {
      return { status: 400, message: "Jadwal sudah dibooking" };
    }

    const result = await BookingsRepository.create({
      barberId: dto.barberId,
      serviceId: dto.serviceId,
      customerUserId: dto.customerUserId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerNote: dto.customerNote,
      bookingDate: start,
    });

    return { status: 201, data: result[0] };
  },

  getBookings() {
    return BookingsRepository.findAll();
  },

  async getBookingById(id: string) {
    const result = await BookingsRepository.findById(id);
    if (!result) {
      return { status: 404, message: "Booking not found" };
    }
    return { status: 200, data: result };
  },

  getBookingsByBarber(barberId: string) {
    return BookingsRepository.findBookingsByBarber(barberId);
  },

  async getBarberBookingsByDate(dateStr: string, barberId: string) {
    if (!barberId) {
      return { status: 400, message: "barberId is required" };
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(date.getTime())) {
      return { status: 400, message: "Invalid date format" };
    }

    const result = await BookingsRepository.findBookingsByBarberAndDate(barberId, date);
    return { status: 200, data: result };
  },

  async updateBookingStatus(
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) {
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return { status: 400, message: "Invalid status" };
    }

    const result = await BookingsRepository.updateStatus(bookingId, status);
    return { status: 200, data: result[0] };
  },

  async getAvailableSlots(dateStr: string, barberId: string) {
    if (!dateStr || dateStr.trim() === "") {
      return { status: 400, message: "Parameter 'date' is required and must be a valid date string" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { status: 400, message: "Parameter 'date' must be a valid date in YYYY-MM-DD format" };
    }

    const allSlots = generateTimeSlots(date);
    const bookings = await BookingsRepository.findBookingsByDate(date);

    const available = allSlots.filter((slot) => {
      return !bookings.some((booking) => {
        if (!["pending", "confirmed"].includes(booking.status)) return false;

        const bookingEnd = new Date(booking.bookingDate);
        bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration);

        return slot.start < bookingEnd && slot.end > booking.bookingDate;
      });
    });

    return {
      status: 200,
      data: available.map((slot) => ({
        start: slot.start,
        end: slot.end,
      })),
    };
  },
};
