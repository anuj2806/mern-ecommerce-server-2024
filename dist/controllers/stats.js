import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/features.js";
export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats;
    const key = "admin-stats";
    if (myCache.has(key)) {
        stats = JSON.parse(myCache.get(key));
    }
    else {
        console.log('hellow');
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };
        const lastSixMonth = {
            start: sixMonthsAgo,
            end: today
        };
        const thisMonthProductPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthProductPromise = Product.find({
            createdAt: {
                $gte: lastSixMonth.start,
                $lte: lastSixMonth.end
            }
        });
        const thisMonthUserPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthUserPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const thisMonthOrderPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });
        const lastMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });
        const lastSixMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastSixMonth.start,
                $lte: lastSixMonth.end,
            }
        });
        const latestTransactionPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);
        const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrder, categories, femaleUser, maleUser, latestTransaction] = await Promise.all([thisMonthProductPromise,
            lastMonthProductPromise,
            thisMonthUserPromise,
            lastMonthUserPromise,
            thisMonthOrderPromise,
            lastMonthOrderPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrderPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "female" }),
            User.countDocuments({ gender: "male" }),
            latestTransactionPromise
        ]);
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        };
        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };
        const orderMonthCount = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        lastSixMonthOrder.forEach((order) => {
            const createdDate = order.createdAt;
            const monthDiff = (today.getMonth() - createdDate.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                orderMonthCount[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        const categoriesCountPromise = categories.map((category) => (Product.countDocuments({ category })));
        const categoriesCount = await Promise.all(categoriesCountPromise);
        const categoryCount = [];
        categories.forEach((category, index) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[index] / productsCount) * 100)
            });
        });
        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }));
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCount,
                revenue: orderMonthlyRevenue,
            },
            genderRatio: {
                female: femaleUser,
                male: maleUser
            },
            latestTransaction: modifiedLatestTransaction
        };
        myCache.set(key, JSON.stringify(stats));
    }
    ;
    res.status(201).json({
        success: true,
        stats,
    });
});
