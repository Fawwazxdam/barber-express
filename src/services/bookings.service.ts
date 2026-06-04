// src/services/bookings.service.ts
import { BookingsRepository } from "../db/bookings.repository";
import { BarberSchedulesRepository } from "../db/barberSchedules.repository";
import { calculateEndTime, isBookingWithinSchedule, generateTimeSlots } from "../utils/bookings.utils";
import { ServicesRepository } from "../db/services.repository";
import { TransactionsRepository } from "../db/transactions.repository";

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

    // Validasi jam operasional barber
    const dayOfWeek = start.getDay();
    const schedule = await BarberSchedulesRepository.findByBarberIdAndDay(dto.barberId, dayOfWeek);

    if (schedule) {
      if (!schedule.isActive) {
        return { status: 400, message: "Barber tidak bertugas pada hari tersebut" };
      }
      if (!isBookingWithinSchedule(start, end, schedule.startTime, schedule.endTime)) {
        return { status: 400, message: "Di luar jam operasional barber" };
      }
    } else {
      // Fallback ke jam operasional global (09:00 - 21:00) jika belum diset
      if (!isBookingWithinSchedule(start, end, "09:00", "21:00")) {
        return { status: 400, message: "Di luar jam operasional" };
      }
    }

    const available = await BookingsRepository.isTimeSlotAvailable(dto.barberId, start, end);
    if (!available) {
      return { status: 400, message: "Jadwal sudah dibooking" };
    }

    const serviceResult = await ServicesRepository.findById(dto.serviceId);
    const service = serviceResult?.[0];
    if (!service) {
      return { status: 404, message: "Service not found" };
    }

    const result = await BookingsRepository.create({
      barberId: dto.barberId,
      tenantId: service.tenantId, // Ensure tenantId is set if not already handled
      serviceId: dto.serviceId,
      customerUserId: dto.customerUserId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerNote: dto.customerNote,
      bookingDate: start,
    });

    const booking = result?.[0];
    if (!booking) {
      return { status: 500, message: "Failed to create booking" };
    }

    // Create an unpaid transaction
    if (service.tenantId) {
      await TransactionsRepository.create({
        tenantId: service.tenantId,
        bookingId: booking.id,
        amount: service.price,
        status: "unpaid",
      });
    }

    return { status: 201, data: booking };
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

  async getTenantBookingsByDate(dateStr: string, tenantId: string) {
    if (!tenantId) {
      return { status: 400, message: "tenantId is required" };
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(date.getTime())) {
      return { status: 400, message: "Invalid date format" };
    }

    const result = await BookingsRepository.findBookingsByTenantAndDate(tenantId, date);
    return { status: 200, data: result };
  },

  async updateBookingStatus(
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    paymentMethod?: "cash" | "qris" | "transfer" | "other"
  ) {
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return { status: 400, message: "Invalid status" };
    }

    const result = await BookingsRepository.updateStatus(bookingId, status);
    const updatedBooking = result[0];

    if (updatedBooking) {
      const transaction = await TransactionsRepository.findByBookingId(bookingId);
      if (transaction) {
        if (status === "completed") {
          await TransactionsRepository.updateStatus(transaction.id, "paid", paymentMethod);
        } else if (status === "cancelled") {
          await TransactionsRepository.updateStatus(transaction.id, "cancelled");
        }
      }
    }

    return { status: 200, data: updatedBooking };
  },

  async getAvailableSlots(dateStr: string, barberId: string) {
    if (!dateStr || dateStr.trim() === "") {
      return { status: 400, message: "Parameter 'date' is required and must be a valid date string" };
    }

    if (!barberId) {
      return { status: 400, message: "barberId is required" };
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { status: 400, message: "Parameter 'date' must be a valid date in YYYY-MM-DD format" };
    }

    const dayOfWeek = date.getDay();
    const schedule = await BarberSchedulesRepository.findByBarberIdAndDay(barberId, dayOfWeek);

    let allSlots = [];
    if (schedule) {
      if (!schedule.isActive) {
        return {
          status: 200,
          data: [],
          message: "Barber sedang libur pada hari ini",
        };
      }
      allSlots = generateTimeSlots(date, schedule.startTime, schedule.endTime);
    } else {
      // Fallback ke jam operasional default jika jadwal belum terisi
      allSlots = generateTimeSlots(date, "09:00", "21:00");
    }

    // Filter booking khusus barber ini saja pada tanggal tersebut
    const bookings = await BookingsRepository.findBookingsByBarberAndDate(barberId, date);

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

  async getDashboardStats(tenantId?: string) {
    const [todayBookings, completedBookingsToday, topHaircuts, todayRevenue] = await Promise.all([
      BookingsRepository.countBookingsToday(tenantId),
      BookingsRepository.countCompletedBookingsToday(tenantId),
      BookingsRepository.getTopHaircutsThisWeek(5, tenantId),
      tenantId ? TransactionsRepository.getRevenueByTenantToday(tenantId) : Promise.resolve(0),
    ]);

    return {
      status: 200,
      data: {
        todayBookings,
        completedBookingsToday,
        topHaircuts,
        todayRevenue,
      },
    };
  },

  async getBarberDashboardStats(barberId: string) {
    if (!barberId) {
      return { status: 400, message: "barberId is required" };
    }

    const [todayBookings, completedBookingsToday, pendingConfirmations, todayRevenue] = await Promise.all([
      BookingsRepository.countBookingsByBarberToday(barberId),
      BookingsRepository.countCompletedBookingsByBarberToday(barberId),
      BookingsRepository.getPendingConfirmationsByBarberToday(barberId),
      TransactionsRepository.getRevenueByBarberToday(barberId),
    ]);

    return {
      status: 200,
      data: {
        todayBookings,
        completedBookingsToday,
        pendingConfirmations,
        todayRevenue,
      },
    };
  },

  async getBarberBookingsByRange(
    barberId: string,
    startDateStr?: string,
    endDateStr?: string
  ) {
    if (!barberId) {
      return { status: 400, message: "barberId is required" };
    }

    // Default: 7 days back
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    // Default: 7 days forward
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { status: 400, message: "Invalid date format" };
    }

    const result = await BookingsRepository.findBookingsByBarberAndDateRange(
      barberId,
      startDate,
      endDate,
      ["pending", "confirmed"]
    );

    return { status: 200, data: result };
  },
};
