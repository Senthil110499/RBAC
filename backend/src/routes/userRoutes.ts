import express from "express";
import { createUser, deleteUser, getUsers, updateUser,toggleUser, uploadExcel, getUserRole, getUserStatus, downloadUsers } from "../controllers/userController";
import { authMiddleware, hasPermission } from "../middleware/authMiddleware";
import { validate, validateExcelUpload } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  userIdParams,
  userListQuery,
  userFilterQuery,
  statsQuery,
} from "../validation/schemas";

const router = express.Router();

router.use(authMiddleware);

router.get("/", hasPermission("read"), validate({ query: userListQuery }), getUsers);
router.post("/create", hasPermission("write"), validate({ body: createUserSchema }), createUser);
router.patch("/status/:id", hasPermission("update"), validate({ params: userIdParams }), toggleUser);
router.put("/:id", hasPermission("update"), validate({ params: userIdParams, body: updateUserSchema }), updateUser);
router.delete("/:id", hasPermission("delete"), validate({ params: userIdParams }), deleteUser);

router.get("/roles", hasPermission("read"), validate({ query: statsQuery }), getUserRole);
router.get("/status", hasPermission("read"), validate({ query: statsQuery }), getUserStatus);

// Upload Excel (.xlsx/.xls, max 5 MB; rows are validated in the controller)
router.post("/upload", hasPermission("write"), validateExcelUpload, uploadExcel);

router.get("/download", hasPermission("read"), validate({ query: userFilterQuery }), downloadUsers);


export default router;



