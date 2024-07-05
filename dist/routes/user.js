import express from 'express';
import { deleteUser, getUser, getallUsers, newUser } from '../controllers/user.js';
import { adminOnly } from '../middlewares/auth.js';
const app = express.Router();
// route - /api/v1/user/new
app.post("/new", newUser);
//route - /api/v1/user/all
app.get("/all", adminOnly, getallUsers);
//route - /api/v1/user/:id
//if route is same we can do chaining
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
export default app;
