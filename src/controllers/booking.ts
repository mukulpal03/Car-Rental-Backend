import { Request, Response } from "express";
import { prisma, Status } from "../lib/prisma";

export const createBooking = async (req: Request, res: Response) => {
  const { carName, days, rentPerDay } = req.body;

  if (!carName || !days || !rentPerDay || days > 365 || rentPerDay > 2000) {
    return res.status(400).json({
      success: false,
      error: "invalid inputs",
    });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        car_name: carName,
        days: days,
        rent_per_day: rentPerDay,
        user_id: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: booking.id,
        totalCost: days * rentPerDay,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  const { summary, bookingId } = req.query;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        user_id: req.user.userId,
        status: {
          in: [Status.BOOKED, Status.COMPLETED],
        },
      },
    });

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.userId,
          username: req.user.username,
          totalBookings: 0,
          totalAmountSpent: 0,
        },
      });
    }

    if (summary == "true") {
      let totalAmount = 0;

      bookings.forEach((booking) => {
        totalAmount += booking.days * booking.rent_per_day;
      });

      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.userId,
          username: req.user.username,
          totalBookings: bookings.length,
          totalAmountSpent: totalAmount,
        },
      });
    }

    if (bookingId) {
      const booking = bookings.find((entry) => entry.id == Number(bookingId));

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "bookingId not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: [
          {
            id: booking.id,
            car_name: booking.car_name,
            days: booking.days,
            rent_per_day: booking.rent_per_day,
            status: booking.status,
            totalCost: booking.days * booking.rent_per_day,
          },
        ],
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  const { carName, days, rentPerDay, status } = req.body;
  const { bookingId } = req.params;

  if (!carName || !days || !rentPerDay || !status) {
    return res.status(400).json({
      success: false,
      error: "invalid inputs",
    });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "booking not found",
      });
    }

    if (booking.user_id != req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "booking does not belong to user",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking updated successfully",
        booking: updatedBooking,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(bookingId),
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "booking not found",
      });
    }

    if (booking.user_id != req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "booking does not belong to user",
      });
    }

    await prisma.booking.delete({
      where: {
        id: booking.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};
