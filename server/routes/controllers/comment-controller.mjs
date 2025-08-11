import models from "../../models/index.js";
import utils from "../../utils/index.js"

async function createComment(req, res, next) {
  try {
    const pid = req.params.pid;
    const user = req.user;

    let cid = req.params.cid;

    if(!cid || cid.trim() === "" || cid.toLowerCase() === "null") {
      cid = null;
    } else {
      if(isNaN(cid)) {
        cid = null;
      }
    }

    const commentText = req.body.commentText;

    if(!commentText || commentText.trim() === "") {
      return res.status(400).json({
        message: "Comment cannot be blank!",
      });
    }

    const comment = await models.sequelize.transaction(async (t) => {
      const newComment = await models.Comment.create({
        post_id: pid,
        user_id: user.user_id,
        reply_id: cid,
        comment_text: commentText,
      }, { transaction: t });

      await models.Post.increment('comments_count', {
        where: { post_id: pid },
        transaction: t
      });

      return newComment;
    });

    setImmediate(async () => {
      try {
        if(!cid) {
          await utils.createCommentNotification({
            ...comment.dataValues,
            username: user.username
          }, models);
        } else {
          const commentData = {
            ...comment.dataValues,
            username: user.username
          };
          await utils.createCommentNotification(commentData, models);
          await utils.createReplyNotification(commentData, models);
        }
      } catch (notifError) {
        console.error('Eroare la trimiterea notificărilor de comentariu:', notifError);
      }
    });

    res.status(200).json({message: "Comment created successfully!", comment});
    
  } catch (err) {
    res.status(500).json({message: "Error creating comment!\n" + err,})
  }
}

async function getComments(req, res, next) {
  try {
    const pid = req.params.pid;

    const comments = await models.Comment.findAll({
      where: {
        post_id: pid,
      },
      include: [{
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      }]
    })

    const formattedComments = await utils.formatBannedUsernames(comments, models);

    res.status(200).json({
      message: "Comments shown successfully!",
      comments: formattedComments,
    })
  } catch (err) {
    res.status(500).json({message: "Error showing comments for this post!\n" + err})
  }
}

async function getReplies(req, res, next) {
  try {
    const pid = req.params.pid;
    const cid = req.params.cid;

    const replies = await models.Comment.findAll({
      where: {
        post_id: pid,
        reply_id: cid,
      },
      include: [{
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      }]
    })

    const formattedReplies = await utils.formatBannedUsernames(replies, models);


    res.status(200).json({
      message: "Replies shown successfully!",
      replies: formattedReplies,
    })
  } catch (err) {
    res.status(500).json({message: "Error showing replies!\n" + err})
  }
}

async function editComment(req, res, next) {
  try {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const user = req.user;

    const newCommentText = req.body.newCommentText;

    const comment = await models.Comment.findOne({
      where: {
        comment_id: cid,
        user_id: user.user_id,
      }
    })

    if(!comment) {
      return res.status(403).json({message: "You don't have permission"});
    }

    if(!newCommentText || newCommentText.trim() === "") {
      return res.status(400).json({message: "Comment cannot be blank!"})
    }

    await models.Comment.update({
      comment_text: newCommentText,
    }, {
      where: {
        post_id: pid,
        comment_id: comment.comment_id,
        user_id: user.user_id,
      }
    })

    res.status(200).json({
      message: "Comment edited successfully!",
    })

  } catch (err) {
    res.status(500).json({message: "Error editing comment!\n" + err})
  }
}

async function deleteComment(req, res, next) {
  try {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const user = req.user;

    const comment = await models.Comment.findOne({
      where: {
        comment_id: cid,
      }
    })

    const post = await models.Post.findOne({
      where: {
        post_id: pid,
      }
    })

    if(!comment) {
      return res.status(404).json({message: "Comment doesn't exist!"});
    }

    if(comment.user_id === user.user_id || (user.user_type === "Moderator" && user.org_id === post.org_id) || user.user_type === "Administrator") {

      await models.Comment.destroy({
        where: {
          post_id: post.post_id,
          comment_id: comment.comment_id,
        }
      })
  
      const count = await models.Comment.count({
        where: { post_id: post.post_id }
      });
      
      await models.Post.update(
        { comments_count: count },
        { where: { post_id: post.post_id } }
      );

      return res.status(200).json({message: "Comment deleted successfully!"})

    } else {
      return res.status(403).json({message: "You don't have permission!"});
    }

  } catch (err) {
    res.status(500).json({message: "Error deleting comment! " + err,})
  }
}

async function getComment(req, res, next) {
  try {
    const pid = req.params.pid;
    const cid = req.params.cid;
    const user = req.user;

    let comment = await models.Comment.findOne({
      attributes: ["comment_text"], 
      where: {
        post_id: pid,
        comment_id: cid,
        user_id: user.user_id,
      }
    })

    if(!comment) {
      return res.status(404).json({ message: "You don't have permission!" });
    }

    return res.status(200).json({ message: "Comment shown successfully!", comment });

  } catch (err) {
    res.status(400).json({message: "Error showing comment! " + err,})
  }
}

export default {
  createComment,
  getComments,
  getReplies,
  editComment,
  deleteComment,
  getComment,
}