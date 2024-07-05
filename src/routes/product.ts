import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProduct, getAllCategories, getSearchProduct, getSingleProduct, getlatestProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";


const app = express.Router();


//To Create New Product  - /api/v1/product/new
app.post("/new",singleUpload,newProduct);

//To get latest Product  - /api/v1/product/latest
app.get("/latest",getlatestProduct);

//To get all unique Categories - /api/v1/product/categories
app.get("/categories",getAllCategories);

//To get all Product  - /api/v1/product/admin-products
app.get("/admin-products",adminOnly,getAdminProduct);

//To get all search products - /api/v1/all/categories
app.get("/all",getSearchProduct);

//To get,update,delete single Product  - /api/v1/product/:id
app.route("/:id").get(getSingleProduct).put(adminOnly,singleUpload,updateProduct).delete(adminOnly,deleteProduct);



export default app