import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";

// Importing Routes
import userRoute from "./routes/user.js";
import productRoute from './routes/product.js';
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
import { config } from "dotenv";
import Razorpay from "razorpay";

config({
    path:"./.env",
});

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET ||  "";
const key_id = process.env.RAZORPAY_KEY_ID || "";
connectDB(mongoURI);

export const razorPay = new Razorpay({
    key_id,
    key_secret,
});
export const myCache = new NodeCache();

const app = express();
app.use(express.json()); //this is middleware


app.use('/api/v1/user',userRoute);
app.use('/api/v1/product',productRoute);
app.use('/api/v1/order',orderRoute);
app.use('/api/v1/payment',paymentRoute);
app.use('/api/v1/dashboard',dashboardRoute);
app.use('/uploads',express.static("uploads"));
app.use(errorMiddleware);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})