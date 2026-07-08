const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    passengerName: {
      type: String,
      required: true,
      minlength: 3
    },
    age: {
      type: Number,
      required: true,
      min: 5
    },
    source: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    journeyDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Journey date must be in the future"
      }
    },
    trainNumber: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
