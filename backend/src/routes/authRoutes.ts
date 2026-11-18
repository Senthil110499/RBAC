import { Router } from "express";
import { login, changePassword } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema, changePasswordSchema } from "../validation/schemas";

const router = Router();

router.post("/login", validate({ body: loginSchema }), login);
router.post("/change-password", validate({ body: changePasswordSchema }), changePassword);

export default router;
    
