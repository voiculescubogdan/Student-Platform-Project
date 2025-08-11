import express from "express";
import controllers from "./controllers/index.mjs"
import middleware from "../middleware/index.mjs";

const apiRouter = express.Router();

apiRouter.get("/users/get-user/:uid", middleware.auth, controllers.user.getUser);
apiRouter.get("/users/get-user/:uid/posts", middleware.auth, controllers.user.getUserPosts);
apiRouter.patch("/users/edit-current-user", middleware.auth, controllers.user.editCurrentUser);
apiRouter.patch("/users/change-password", middleware.auth, controllers.user.changePassword);
apiRouter.get("/users/get-organizations/followed", middleware.auth, controllers.user.getFollowedOrganizations)
apiRouter.get("/users/get-organizations", middleware.auth, controllers.user.getAllOrganizations)
apiRouter.get("/users/get-organization/:oid", middleware.auth, controllers.user.getOrganization);
apiRouter.get("/users/get-organization/:oid/posts", middleware.auth, controllers.post.getOrganizationPosts);
apiRouter.post("/users/get-organization/:oid/toggle-follow", middleware.auth, controllers.follow.toggleFollowOrganization)
apiRouter.get("/users/get-organization/:oid/follow-status", middleware.auth, controllers.follow.getFollowStatus)
apiRouter.get("/users/get-follows", middleware.auth, controllers.follow.getFollows);
apiRouter.get("/users/get-notifications", middleware.auth, controllers.notification.getNotifications);
apiRouter.patch("/users/get-notifications/mark-read", middleware.auth, controllers.notification.markAsRead);
apiRouter.patch("/users/get-notifications/get-notification/:nid/mark-read", middleware.auth, controllers.notification.markAsRead);

apiRouter.post("/users/posts/create-post", middleware.auth, middleware.checkType(["Membru", "Moderator", "Administrator"]), middleware.upload, controllers.post.createPost);
apiRouter.get("/users/posts/get-posts/followed", middleware.auth, controllers.post.getAllFollowedOrganizationsPosts);
apiRouter.get("/users/posts/get-posts", middleware.auth, controllers.post.getAllActivePosts)
apiRouter.get("/users/posts/get-post/:pid", middleware.auth, controllers.post.getPost);
apiRouter.patch("/users/posts/edit-post/:pid", middleware.auth, middleware.checkType(["Membru", "Moderator", "Administrator"]), middleware.upload, controllers.post.editPost);
apiRouter.delete("/users/posts/delete-post/:pid", middleware.auth, middleware.checkType(["Membru", "Moderator", "Administrator"]), controllers.post.deletePost);
apiRouter.get("/users/posts/get-posts/sorted", middleware.auth, controllers.post.sortPosts);
apiRouter.get("/users/posts/filtered/:oid", middleware.auth, controllers.post.filterPosts);
apiRouter.get("/users/posts/filtered/:oid/sorted", middleware.auth, controllers.post.sortFilteredPosts)
apiRouter.post("/users/posts/get-post/:pid/report", middleware.auth, controllers.reports.reportPost)

apiRouter.post("/users/posts/get-post/:pid/create-comment", middleware.auth, middleware.checkStatus(), controllers.comment.createComment)
apiRouter.post("/users/posts/get-post/:pid/create-comment/:cid", middleware.auth, middleware.checkStatus(), controllers.comment.createComment)
apiRouter.get("/users/posts/get-post/:pid/comments", middleware.auth, controllers.comment.getComments)
apiRouter.get("/users/posts/get-post/:pid/get-replies/:cid", middleware.auth, controllers.comment.getReplies)
apiRouter.patch("/users/posts/get-post/:pid/get-comment/:cid/edit", middleware.auth, controllers.comment.editComment)
apiRouter.delete("/users/posts/get-post/:pid/get-comment/:cid/delete", middleware.auth, controllers.comment.deleteComment)
apiRouter.get("/users/posts/get-post/:pid/get-comment/:cid", middleware.auth, controllers.comment.getComment)
apiRouter.post("/users/posts/get-post/:pid/report-comment/:cid", middleware.auth, middleware.checkStatus(), controllers.reports.reportComment)

apiRouter.use("/users/admin/get-users", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.getAllUsers);
apiRouter.get("/users/admin/get-all-posts", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.getAllPosts)
apiRouter.get("/users/admin/get-user/:uid", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.getUser)
apiRouter.delete("/users/admin/get-user/:uid/delete", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.deleteUser)
apiRouter.get("/users/admin/get-user/:uid/change-type", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.getType);
apiRouter.patch("/users/admin/get-user/:uid/change-type", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.changeType);
apiRouter.get("/users/admin/get-user/:uid/get-organization", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.getOrganization);
apiRouter.patch("/users/admin/get-user/:uid/change-org", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.changeOrganization);
apiRouter.post("/organizations/admin/create-organization", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.createOrganization);
apiRouter.delete("/organizations/admin/delete-organization/:oid", middleware.auth, middleware.checkType(["Administrator"]), controllers.admin.deleteOrganization)

apiRouter.post("/users/posts/get-post/:pid/likeUnlikePost", middleware.auth, controllers.likedPost.likeUnlikePost)
apiRouter.get("/users/posts/liked-posts", middleware.auth, controllers.likedPost.allLikedPosts);
apiRouter.post("/users/posts/get-comment/:cid/likeUnlikeComment", middleware.auth, controllers.likedComment.likeUnlikeComment);
apiRouter.get("/users/posts/get-comments/liked-comments", middleware.auth, controllers.likedComment.allLikedComments)

apiRouter.get("/users/get-assigned-posts", middleware.auth, middleware.checkType(["Moderator"]), controllers.assignedPost.getAssignedPosts)
apiRouter.post("/users/posts/get-post/:pid/handlePost", middleware.auth, middleware.checkType(["Moderator"]), controllers.assignedPost.handlePost)
apiRouter.get("/users/get-reports", middleware.auth, middleware.checkType(["Moderator"]))
apiRouter.get("/users/get-reports/reported-posts", middleware.auth, middleware.checkType(["Moderator"]), controllers.reports.getReportedPosts)
apiRouter.get("/users/get-reports/reported-comments", middleware.auth, middleware.checkType(["Moderator"]), controllers.reports.getReportedComments)
apiRouter.patch("/users/get-reports/mark-reviewed", middleware.auth, middleware.checkType(["Moderator"]), controllers.reports.markReportAsReviewed);

apiRouter.patch("/users/admin/get-user/:uid/ban", middleware.auth, middleware.checkType(["Administrator"]), controllers.blacklist.banUser);
apiRouter.patch("/users/admin/get-user/:uid/unban", middleware.auth, middleware.checkType(["Administrator"]), controllers.blacklist.unBanUser);


export default apiRouter;