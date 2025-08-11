import user from "./user-controller.mjs"
import auth from "./auth-controller.mjs"
import post from "./post-controller.mjs"
import comment from "./comment-controller.mjs";
import admin from "./admin-controller.mjs"
import likedPost from "./likedPost-controller.mjs";
import likedComment from "./likedComment-controller.mjs"
import assignedPost from "./assignedPost-controller.mjs";
import blacklist from "./blacklist-controller.mjs";
import reports from "./reports-controller.mjs";
import follow from "./follow-controller.mjs";
import notification from "./notifications-controller.mjs";

export default {
  user,
  auth,
  post,
  comment,
  admin,
  likedPost,
  likedComment,
  assignedPost,
  blacklist,
  reports,
  follow,
  notification,
}