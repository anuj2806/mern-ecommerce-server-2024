
import { razorPay } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req,res,next)=>{
    const {amount} = req.body;
    if(!amount ) return next( new ErrorHandler("Please enter amount",400));
   const PaymentIntent = await razorPay.orders.create({
        amount:Number(amount)*100,
        currency: "INR",
        receipt: "order_rcptid_11"
   })

    return res.status(200).json({
        success:true,
        clientScreat:PaymentIntent
    })
})
export const newCoupon = TryCatch(async (req,res,next)=>{
    const {code,amount} = req.body;
    if(!code || !amount ) return next( new ErrorHandler("Please enter both coupon and amount",400));
    await Coupon.create({code,amount})

    return res.status(200).json({
        success:true,
        message:`Coupon ${code} Created Successfully`
    })
})

export const applyDiscount = TryCatch(async (req,res,next)=>{
    const { coupon } = req.query;
    const discount = await Coupon.findOne({code:coupon});
    if(!discount ) return next( new ErrorHandler("Invalid Coupon",400));
    return res.status(200).json({
        success:true,
        discount:discount.amount
    })
})
export const allCoupons = TryCatch(async (req,res,next)=>{
    const coupons = await Coupon.find({});
    
    return res.status(200).json({
        success:true,
        coupons
    })
})
export const getCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const coupon = await Coupon.findById(id);
  
    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
  
    return res.status(200).json({
      success: true,
      coupon,
    });
  });
  
export const updateCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const { code, amount } = req.body;
  
    const coupon = await Coupon.findById(id);
  
    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
  
    if (code) coupon.code = code;
    if (amount) coupon.amount = amount;
  
    await coupon.save();
  
    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} Updated Successfully`,
    });
  });
export const deleteCoupon = TryCatch(async (req,res,next)=>{
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if(!coupon ) return next( new ErrorHandler("Invalid Coupon",400));
    return res.status(200).json({
        success:true,
        message: `Coupon ${coupon.code} Deleted Successfully`,
    })
})