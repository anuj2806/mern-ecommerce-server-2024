import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { myCache } from "../app.js";
export const myOrders = TryCatch(async (req, res, next) => {
    // user is the variable where you want to store the extracted value from id that come after destructuring of req.query.
    const { id: user } = req.query;
    const key = `my-orders-${user}`;
    let orders = [];
    if (myCache.has(key)) {
        orders = JSON.parse(myCache.get(key));
    }
    else {
        orders = await Order.find({ user });
        myCache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({
        success: true,
        orders
    });
});
export const allOrders = TryCatch(async (req, res, next) => {
    const key = `all-orders`;
    let orders = [];
    if (myCache.has(key))
        orders = JSON.parse(myCache.get(key));
    else {
        orders = await Order.find().populate("user", "name");
        myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    // user is the variable where you want to store the extracted value from id that come after destructuring of req.query.
    const { id } = req.params;
    const key = `orders-${id}`;
    let order;
    if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key));
    }
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order)
            return next(new ErrorHandler("Order not found", 400));
        myCache.set(key, JSON.stringify(order));
    }
    res.status(200).json({
        success: true,
        order
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
        return next(new ErrorHandler("Please Enter All Fields", 400));
    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    await invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    await invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: String(order._id) });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    await order.deleteOne();
    await invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: String(order._id) });
    return res.status(201).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
