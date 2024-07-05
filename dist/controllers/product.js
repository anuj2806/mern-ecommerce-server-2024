import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
export const getlatestProduct = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("latest-products")) {
        products = JSON.parse(myCache.get("latest-products"));
    }
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-products", JSON.stringify(products));
    }
    return res.status(201).json({
        success: true,
        products
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (myCache.has("all-products")) {
        categories = JSON.parse(myCache.get("all-products"));
    }
    else {
        categories = await Product.distinct("category");
        myCache.set("latest-products", JSON.stringify(categories));
    }
    return res.status(201).json({
        success: true,
        categories
    });
});
export const getAdminProduct = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("admin-products")) {
        products = JSON.parse(myCache.get("admin-products"));
    }
    else {
        products = await Product.find({});
        myCache.set("admin-products", JSON.stringify(products));
    }
    return res.status(201).json({
        success: true,
        products
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const id = req.params.id;
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`));
    }
    else {
        product = await Product.findById(id);
        if (!product)
            return next(new ErrorHandler("Invalid Id", 400));
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please Add Photo", 400));
    if (!name || !price || !stock || !category) {
        rm(photo.path, () => (console.log("Deleted")));
        return next(new ErrorHandler("Please Enter All Fields", 400));
    }
    ;
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo.path,
    });
    await invalidateCache({ product: true });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully"
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!product)
        return next(new ErrorHandler("Invalid Id", 400));
    if (photo) {
        rm(product.photo, () => {
            console.log("photo delete successfully");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    await invalidateCache({ product: true });
    return res.status(200).json({
        success: true,
        message: "Product updated Successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Invalid Id", 400));
    rm(product.photo, () => { });
    await product.deleteOne();
    await invalidateCache({ product: true });
    return res.status(200).json({
        success: true,
        message: "Product delete successfully",
    });
});
export const getSearchProduct = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    let products;
    let totalPage;
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    const [productsFetched, filteredOnlyProduct] = await Promise.all([
        Product.find(baseQuery).sort(sort && { price: sort === 'asc' ? 1 : -1 }).limit(limit).skip(skip),
        Product.find(baseQuery)
    ]);
    products = productsFetched;
    totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(201).json({
        success: true,
        products,
        totalPage
    });
});
