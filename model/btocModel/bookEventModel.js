const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const status = require("../../enums/status");
const bookingStatus = require("../../enums/bookingStatus");
const offerType = require("../../enums/offerType");
const approvalStatus = require("../../enums/approveStatus");
mongoose.pluralize(null);
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosePaginate = require("mongoose-paginate-v2");

const bookEventSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    noOfMember: {
      type: Number,
    },
    adults:{
      type: Boolean,
    },
    child:{
      type: Boolean,
    },
    couple:{
      type: Boolean,
    },
    price: {
      type: Number,
    },
    eventDate:{
      type: String
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "userTransactions",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "skyTraislEvents",
    },
    tickets: [
       { type: String } 
    ],
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);
bookEventSchema.plugin(mongoosePaginate);

bookEventSchema.plugin(aggregatePaginate);
const book = mongoose.model("eventBookings", bookEventSchema);

module.exports = book;
