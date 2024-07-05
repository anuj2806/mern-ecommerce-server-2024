import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = () => {
    mongoose
        .connect("mongodb://127.0.0.1:27017/", {
        dbName: "Ecommerce_24",
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
export const invalidateCache = async ({ product, order, admin }) => {
    if (product) {
        let productKeys = ["latest-products", "all-products", "admin-products"];
        const product = await Product.find({}).select("_id");
        product.forEach((i) => {
            if (myCache.has(`product-${i._id}`)) {
                productKeys.push(`product-${i._id}`);
            }
        });
        myCache.del(productKeys);
    }
};
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
