import models from "../models/index.js";

function checkPostStatusActive() {
  return async (req, res, next) => {
    const pid = req.params.pid;
    if (!pid) {
      return res.status(400).json({ message: "Missing post_id parameter." });
    }

    try {
      const post = await models.Post.findOne({
        where: { post_id: pid }
      });
      
      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }
      
      if (post.status !== "active") {
        return res.status(403).json({ message: "This post is not active." });
      }
      
      next();
    } catch (err) {
      res.status(500).json({ message: "Error checking status! " + err,});
    }
  }
}

export default checkPostStatusActive;