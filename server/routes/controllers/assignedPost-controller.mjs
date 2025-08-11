import models from "../../models/index.js";
import utils from "../../utils/index.js";

async function getAssignedPosts(req, res, next) {
  try {

    const user = await models.User.findOne({
      where: {
        user_id: req.user.user_id,
      }
    })

    const posts = await models.AssignedPost.findAll({
      where: {
        user_id: user.user_id,
      }
    })

    if(!posts) {
      return res.status(200).json({message: "Nu exista postari!"})
    }

    res.status(200).json({message: "Postari asignate afisate cu succes!", posts});

  } catch (err) {
    res.status(500).json({message: "Error getting assigned posts! " + err,})
  }
}

async function handlePost(req, res, next) {
  try {
    const pid = req.params.pid;
    const handle = req.query.handle;
    const moderatorId = req.user.user_id;

    const assignedPost = await models.AssignedPost.findOne({
      where: { post_id: pid }
    });

    if (!assignedPost) {
      return res.status(404).json({message: "Postarea nu a fost găsită sau nu este asignată!"});
    }

    if (moderatorId !== assignedPost.user_id) {
      return res.status(403).json({message: "You don't have permission!"});
    }

    await models.Post.update({
      status: handle,
    }, {
      where: { post_id: pid }
    });

    await models.AssignedPost.destroy({
      where: { post_id: pid }
    });

    const updatedPost = await models.Post.findByPk(pid);

    setImmediate(async () => {
      try {
        await utils.createStatusChangeNotification(updatedPost, "pending", models);
        
        if(handle === "active") {
          await utils.createPostNotifications(updatedPost, models);
        }
      } catch (error) {
        console.error('Eroare la notificări:', error);
      }
    });

    const message = handle === "active" ? "Postare acceptata!" : "Postare respinsa!";
    res.status(200).json({message});

  } catch (err) {
    res.status(500).json({message: "Error handling post! " + err})
  }
}

export default {
  getAssignedPosts,
  handlePost,
}