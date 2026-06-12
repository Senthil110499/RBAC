import express from "express";
import multer from "multer";
import { createUser, deleteUser, getUsers, updateUser,toggleUser, uploadExcel, getUserRole, getUserStatus, downloadUsers } from "../controllers/userController";
import { authMiddleware, hasPermission } from "../middleware/authMiddleware";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware);

router.get("/", hasPermission("read"), getUsers);
router.post("/create", hasPermission("write"), createUser);
router.patch("/status/:id", hasPermission("update"), toggleUser);
router.put("/:id", hasPermission("update"), updateUser);
router.delete("/:id", hasPermission("delete"), deleteUser);

router.get("/roles", hasPermission("read"), getUserRole);
router.get("/status", hasPermission("read"), getUserStatus);

// Upload Excel
router.post("/upload", hasPermission("write"), upload.single("file"), uploadExcel);

router.get("/download", hasPermission("read"), downloadUsers);


export default router;



