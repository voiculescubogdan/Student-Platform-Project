import models from "../../models/index.js";
import { Op } from 'sequelize';
import utils from "../../utils/index.js";

async function likeUnlikeComment(req, res, next) {
  try {
    const cid = req.params.cid;
    const user = req.user;

    const existingLike = await models.LikedComment.findOne({
      where: {
        comment_id: cid,
        user_id: user.user_id,
      }
    });

    if (!existingLike) {
      await models.sequelize.transaction(async (t) => {
        await models.LikedComment.create({
          comment_id: cid,
          user_id: user.user_id,
        }, { transaction: t });
    
        await models.Comment.increment('likes_count', {
          where: { comment_id: cid },
          transaction: t
        });
      });

      setImmediate(async () => {
        try {
          await utils.createLikeNotification({
            comment_id: cid,
            user_id: user.user_id,
            username: user.username
          }, 'comment', models);
        } catch (error) {
          console.error('Eroare la trimiterea notificării:', error);
        }
      });

      return res.status(200).json({message: "Comment liked successfully!"});
    } else {
      await models.sequelize.transaction(async (t) => {
        await models.LikedComment.destroy({
          where: {
            comment_id: cid,
            user_id: user.user_id,
          },
          transaction: t
        });
    
        await models.Comment.decrement('likes_count', {
          where: {
            comment_id: cid,
            likes_count: { [Op.gt]: 0 }
          },
          transaction: t
        });
      });

      return res.status(200).json({message: "Comment unliked successfully!"});
    }

  } catch (err) {
    res.status(500).json({message: "Error liking comment! " + err});
  }
}

async function allLikedComments(req, res, next) {
  try {
    const userId = req.user.user_id;
    
    const likedComments = await models.LikedComment.findAll({
      where: { user_id: userId },
      attributes: ['comment_id']
    });
    
    res.status(200).json({ likedComments });
  } catch (err) {
    res.status(500).json({message: "Eroare la obtinerea comentariilor apreciate! ", err})
  }
}

export default {
  likeUnlikeComment,
  allLikedComments,
}