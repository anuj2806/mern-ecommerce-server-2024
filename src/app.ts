import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";
// Importing Routes
import userRoute from "./routes/user.js";
import productRoute from './routes/product.js';
import orderRoute from "./routes/order.js";

const port = 4000;
export const myCache = new NodeCache();
const app = express();
connectDB();
app.use(express.json()); //this is middleware


app.use('/api/v1/user',userRoute);
app.use('/api/v1/product',productRoute);
app.use('/api/v1/order',orderRoute);

app.use('/uploads',express.static("uploads"));
app.use(errorMiddleware);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})