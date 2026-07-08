const express = require("express");

const Booking = require("../models/Booking");

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const booking = await Booking.create(req.body);
        res.status(201).json(booking);
    } catch (error) {
        next(error);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const { source, desitination, page = 1 } = req.query;

        const filter = {};
        if (source) filter.source = source;
        if (desitination) filter.destination = desitination;

        const limit = 5;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find(filter)
            .sort({ journeyDate: 1 })
            .skip(skip)
            .limit(limit);
        res.json(bookings);
    } catch (error) {
        next(error);
    }
});

// DELETE booking
router.delete("/:id", async (req, res, next) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking canceled successfully", deletedBooking });
    } catch (error) {
        next(error);
    }
});

// GET booking stats (total count, distribution by source/destination or dates)
router.get("/stats/overview", async (req, res, next) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const futureBookings = await Booking.countDocuments({ journeyDate: { $gt: new Date() } });

        // Group by train to get popular trains
        const trainStats = await Booking.aggregate([
            { $group: { _id: "$trainNumber", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.json({
            totalBookings,
            futureBookings,
            popularTrains: trainStats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
