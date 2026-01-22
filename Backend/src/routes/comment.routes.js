// routes/commentRoutes.js
import express from "express";
import {
  createComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
} from "../controller/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router({ mergeParams: true });

router
  .route("/:ticketId/comments")
  .post(verifyJWT, upload.array("attachments", 2), createComment)
  .get(verifyJWT, getCommentsByTicket);

router
  .route("/:commentId")
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;
