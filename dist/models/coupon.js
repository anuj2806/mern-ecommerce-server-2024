import mongoose from "mongoose";
const schema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter code"],
    },
    amount: {
        type: Number,
        required: [true, "Please enter amount"],
    }
});
export const Coupon = mongoose.model("Coupon", schema);
