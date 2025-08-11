import passport from "./passport-middleware.mjs";
import auth from "./auth-middleware.mjs";
import checkType from "./checkType-middleware.mjs";
import upload from "./upload-middleware.mjs";
import checkStatus from "./checkStatus-middleware.mjs";
import checkEmailConfirmed from "./emailConfirmed-middleware.mjs";

export default {
  passport,
  auth,
  checkType,
  upload,
  checkStatus,
  checkEmailConfirmed,
}