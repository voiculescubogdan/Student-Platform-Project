import models from "../../models/index.js";
import { Op } from 'sequelize';
import utils from "../../utils/index.js";

async function likeUnlikePost(req, res, next) {
  try {
    const pid = req.params.pid;
    const user = req.user;

    const existingLike = await models.LikedPost.findOne({
      where: {
        post_id: pid,
        user_id: user.user_id,
      }
    });

    if (!existingLike) {
      await models.sequelize.transaction(async (t) => {
        await models.LikedPost.create({
          post_id: pid,
          user_id: user.user_id,
        }, { transaction: t });
    
        await models.Post.increment('likes_count', {
          where: { post_id: pid },
          transaction: t
        });
      });

      setImmediate(async () => {
        try {
          await utils.createLikeNotification({
            post_id: pid,
            user_id: user.user_id,
            username: user.username
          }, 'post', models);
        } catch (error) {
          console.error('Eroare la trimiterea notificării:', error);
        }
      });

      return res.status(200).json({message: "Post liked successfully!"});
    } else {
      await models.sequelize.transaction(async (t) => {
        await models.LikedPost.destroy({
          where: {
            post_id: pid,
            user_id: user.user_id,
          },
          transaction: t
        });
    
        await models.Post.decrement('likes_count', {
          where: { 
            post_id: pid,
            likes_count: { [Op.gt]: 0 }
          },
          transaction: t
        });
      });

      return res.status(200).json({message: "Post unliked successfully!"});
    }

  } catch (err) {
    res.status(500).json({
      message: "Error liking post! " + err,
    });
  }
}

async function allLikedPosts(req, res, next) {
  try {
    const userId = req.user.user_id;
    
    const likedPosts = await models.LikedPost.findAll({
      where: { user_id: userId },
      attributes: ['post_id']
    });
    
    res.status(200).json({ likedPosts });
  } catch (err) {
    res.status(500).json({message: "Eroare la obtinerea postarilor apreciate! ", err})
  }
}

export default {
  likeUnlikePost,
  allLikedPosts,
}