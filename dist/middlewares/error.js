export const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal server error");
    err.statusCode || (err.statusCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid Id";
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
//wrapper function that return a function that is same as controller 
// jo async function as a argument leta hai or jab success true hota hai to 
//same function return kr deta 
//else error ke liye next() call kr deta hai
// jisse har controller me try/catch nhi likhna padta
export const TryCatch = (func) => ((req, res, next) => {
    return Promise
        .resolve(func(req, res, next))
        .catch(next);
});
