import { Router } from "express";
import {
  registerUser,
  loggedInUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  getAllAgents,
  updateAccountDetails,
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

router.route("/login").post(loggedInUser);
router.route("/refresh-token").post(refreshAccessToken);

//secure route
router.use(verifyJWT);

router.route("/logout").post(logoutUser);
router.route("/current-user").get(getCurrentUser);
router.route("/change-password").post(changeCurrentPassword);
router.route("/update-account").patch(updateAccountDetails);

router.route("/avatar").patch(upload.single("avatar"), updateUserAvatar);

//role specific routes
router.route("/agents").get(checkRole(["admin"]), getAllAgents);

export default router;
