import express from "express";
import controllers from "./controllers/index.mjs"
import middleware from "../middleware/index.mjs"

const authRouter = express.Router();

authRouter.post("/register", controllers.auth.registerUser);
authRouter.post("/login", middleware.checkEmailConfirmed, controllers.auth.loginUser);
authRouter.post("/logout", middleware.auth, controllers.auth.logoutUser);

authRouter.post("/request-password-reset", controllers.auth.requestPasswordReset);
authRouter.post("/reset-password/:token", controllers.auth.resetPassword)

authRouter.get("/confirm-email/:token", controllers.auth.confirmEmail);
authRouter.post("/resend-confirmation", controllers.auth.resendConfirmationEmail);

export default authRouter;