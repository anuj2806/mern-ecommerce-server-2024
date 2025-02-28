import { NextFunction,Request,Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(async(
    req : Request<{},{},NewUserRequestBody>,res,next)=>{
        //return next(new Error("MERI ERROR"))
        //return next(new ErrorHandler("MERI ERROR",300))
        const { name, email, photo, gender, _id, dob,role} = req.body;
        let user = await User.findById(_id);
        if(user){
            return res.status(200).json({
                success:true,
                message:`Welcome, ${user.name}`,
            })
        }
        if(!_id || !name || !email || !photo || !gender || !dob){
            return next(new ErrorHandler("Please add all fields",400));
        }
        user = await User.create({
            name,
            email,
            photo, 
            gender,
            _id,
            role,
            dob:new Date(dob),
        });
})

export const getallUsers = TryCatch(async(req,res,next)=>{
    const users = await User.find({});

    return res.status(200).json({
        success:true,
        users,
    })
})
export const getUser = TryCatch(async(req,res,next)=>{
    const id = req.params.id;
    const user = await User.findById(id);

    if(!user) return next(new ErrorHandler("Invalid Id",400))
    
    return res.status(200).json({
        success:true,
        user,
    })
})
export const deleteUser = TryCatch(async(req,res,next)=>{
    const id = req.params.id;
    const user = await User.findById(id);

    if(!user) return next(new ErrorHandler("Invalid Id",400))
    
    await user.deleteOne();
    return res.status(200).json({
        success:true,
        message:"User Deleted Successfully",
    })
})