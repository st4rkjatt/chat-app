import { 
    Register, 
    Login, 
    ForgetPassword, 
    VerifyOTP, 
    ResetPassword, 
    getAllUser, 
    getUserForSidebar
} from "../controller/authController.js";
import { Router } from "express";
import { auth } from "../middleware/auth.js";
const router = Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/forget-password", ForgetPassword);
router.post("/verify-otp", VerifyOTP);
router.post("/reset-password", ResetPassword);
router.get("/get-all-user", auth, getAllUser);
router.get("/users", auth, getUserForSidebar);

export default router;
