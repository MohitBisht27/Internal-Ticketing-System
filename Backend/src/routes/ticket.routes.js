import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  getTicketStats,
  getAgentPerformance,
  updateOverdueTickets,
  getAllTickets,
} from "../controller/ticket.controller.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(checkRole(["employee"]), upload.array("attachments", 5), createTicket)
  .get(getTickets);

router.get("/admin/all", checkRole(["admin"]), getAllTickets);

router.route("/stats").get(getTicketStats);
router.route("/performance").get(checkRole(["admin"]), getAgentPerformance);

// Admin maintenance
router
  .route("/update-overdue")
  .patch(checkRole(["admin"]), updateOverdueTickets);

// Single ticket operations
router
  .route("/:ticketId")
  .get(getTicketById)
  .patch(checkRole(["agent", "admin"]), updateTicketStatus);

// Ticket assignment
router.route("/:ticketId/assign").patch(checkRole(["admin"]), assignTicket);

export default router;
