import models from "../../models/index.js";
import { Op } from 'sequelize';
import utils from "../../utils/index.js"

async function getAllUsers(req, res, next) {
  try {
    const users = await models.User.findAll();

    const usersWithBanStatus = await utils.addBanStatus(users, models);

    res.status(200).json({
      message: "Acces permis - All users shown successfully!",
      users: usersWithBanStatus,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllPosts(req, res, next) {
  try {
    const posts = await models.Post.findAll({
      include: [{
            model: models.User,
            attributes: ['user_id', 'username', 'email'],
            required: true
      }]
    });

      const formattedPosts = await utils.formatBannedUsernames(posts, models);

    res.status(200).json({
      message: "Acestea sunt toate postarile",
      posts: formattedPosts,
    })
  } catch (err) {
    res.status(500).json({message: "Error getting all posts! " + err,})
  }
}

async function getUser(req, res, next) {
  try {
    const uid = req.params.uid;

    const user = await models.User.findOne({
      where: {
        user_id: uid,
      }
    })

    const userWithBanStatus = await utils.addBanStatus(user, models);

    res.status(200).json({
      message: "User profile shown successfully!",
      user: userWithBanStatus,
    })
  } catch (err) {
    res.status(500).json({
      message: "Error getting user!\n" + err,
    })
  }
}

async function getType(req, res, next) {
  try {
    const uid = req.params.uid;

    const type = await models.User.findOne({
      attributes: ["user_type"],
      where: {
        user_id: uid,
      }
    })

    res.status(200).json({message: "Type shown successfully!", type});
  } catch (err) {
    res.status(500).json({
      message: "Error getting user type! " + err,
    })
  }
}

async function changeType(req, res, next) {
  try {
    const uid = req.params.uid;

    let type = req.body.type;

    const user = await models.User.findOne({
      where: {
        user_id: uid,
      }
    })

    if(!user.org_id) {
      return res.status(500).json({message: "User is not in any organization!"})
    }

    await models.User.update({
      user_type: type,
    }, {
      where: {
        user_id: user.user_id,
      }
    })

    res.status(200).json({
      message: "User Type changed with success!",
    })

  } catch (err) {
    res.status(500).json({message: "Error changing user type! " + err})
  }
}

async function getOrganization(req, res, next) {
  try {
    const uid = req.params.uid;

    const organization = await models.User.findOne({
      attributes: ["org_id"],
      where: {
        user_id: uid,
      },
      include: [
        {
          model: models.Organization,
          attributes: ["name"],
        }
      ]
    })

    res.status(200).json({message: "Type shown successfully!", organization});

  } catch (err) {
    res.status(500).json({message: "Error showing user organization! " + err})
  }
}

async function changeOrganization(req, res, next) {
  try {
    const uid = req.params.uid;

    let organization = req.body.organization;

    let oldOrganization = await models.User.findOne({
      attributes: ["org_id"],
      where: {
        user_id: uid,
      }
    })

    if(organization === "None") {

      if(!oldOrganization.org_id) {
        return res.status(400).json({message: "User wasn't already in any organization!"});
      }

      await models.User.update({
        org_id: null,
        user_type: "Student",
      }, {
        where: {
          user_id: uid,
        }
      })

      if(oldOrganization.org_id) {
        await models.Organization.decrement({
          members_count: 1,
        }, {
          where: {
            org_id: oldOrganization.org_id,
            members_count: { [Op.gt]: 0 }
          }
        });
      }

      return res.status(200).json({message: "User Organization changed with succes! ( NONE )"})
    }

    let newOrganization = await models.Organization.findOne({
      attributes: ["org_id"],
      where: {
        name: organization,
      }
    })

    if(oldOrganization.org_id === newOrganization.org_id) {
      return res.status(200).json({ message: "User is already in this organization" });
    }

    await models.User.update({
      org_id: newOrganization.org_id,
      user_type: "Membru",
    }, {
      where: {
        user_id: uid,
      }
    })

    await models.Organization.decrement({
      members_count: 1,
    }, {
      where: {
        org_id: oldOrganization.org_id,
        members_count: { [Op.gt]: 0 }
      }
    })

    await models.Organization.increment({
      members_count: 1,
    }, {
      where: {
        org_id: newOrganization.org_id,
      }
    })

    res.status(200).json({
      message: "User Organization changed with succes!",
    })

  } catch (err) {
    res.status(500).json({message: "Error changing organization! " + err});
  }
}

async function deleteUser(req, res, next) {
  try {
    const uid = req.params.uid;

    const user = await models.User.findOne({
      where: {
        user_id: uid,
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await deleteMediaUser(user.user_id);
    await deleteLikesPost(user.user_id);
    await deleteLikesComment(user.user_id);

    await models.User.destroy({
      where: {
        user_id: uid,
      }
    })

    return res.status(200).json({
      message: "User deleted with success!"
    })


  } catch (err) {
    res.status(500).json({
      message: "Error deleting user! " + err,
    })
  }
}

async function deleteMediaUser(uid) {
const userPosts = await models.Post.findAll({
  where: { user_id: uid },
  attributes: ['post_id'],
});

const postIds = userPosts.map(post => post.post_id);

if (postIds.length > 0) {
  await models.PostMedia.destroy({
    where: {
      post_id: { [Op.in]: postIds }
    },
    individualHooks: true,
  });
}
}

async function deleteLikesPost(uid) {
  const likedPosts = await models.LikedPost.findAll({
    where: { user_id: uid },
    attributes: ['post_id'],
  });

  for (const like of likedPosts) {
    await models.Post.decrement(
      { likes_count: 1 },
      {
        where: {
          post_id: like.post_id,
          likes_count: { [Op.gt]: 0 },
        },
      }
    );
  }
}

async function deleteLikesComment(uid) {
  const likedComments = await models.LikedComment.findAll({
    where: { user_id: uid },
    attributes: ['comment_id'],
  });

  for (const like of likedComments) {
    await models.Comment.decrement(
      { likes_count: 1 },
      {
        where: {
          comment_id: like.comment_id,
          likes_count: { [Op.gt]: 0 },
        },
      }
    );
  }
}

async function createOrganization(req, res, next) {
  try {

    const name = req.body.name;
    const description = req.body.description;

    if(!name || name.trim() === "") {
      return res.status(500).json({message: "Organization Name is empty"})
    }

    if(!description || description.trim() === "") {
      return res.status(500).json({message: "Organization Description is empty"})
    }

    const organization = await models.Organization.create({
      name: name,
      description: description,
      members_count: 0,
    })

    res.status(200).json({message: "Organization created successfully!", organization})

  } catch (err) {
    res.status(500).json({message: "Error creating organization! " + err})
  }
}

async function deleteMediaOrganization(oid) {
  const orgPosts = await models.Post.findAll({
    where: { org_id: oid },
    attributes: ['post_id'],
  });
  const postIds = orgPosts.map(post => post.post_id);

  if (postIds.length > 0) {
    await models.PostMedia.destroy({
      where: {
        post_id: { [Op.in]: postIds }
      },
      individualHooks: true,
    });
  }
}

async function deleteOrganization(req, res, next) {
  try {
    const oid = req.params.oid;

    const organization = await models.Organization.findOne({
      where: {
        org_id: oid,
      }
    })

    if(!organization) {
      return res.status(500).json({message: "Organization doesn't exist!"})
    }

    await models.User.update({
      org_id: null,
      user_type: "Student",
    }, {
      where: {
        org_id: organization.org_id,
      }
    })

    await deleteMediaOrganization(organization.org_id)

    await models.Organization.destroy({
      where: {
        org_id: organization.org_id,
      }
    })

    res.status(200).json({message: "Organization deleted successfully!"})


  } catch (err) {
    res.status(500).json({message: "Error deleting organization! " + err,})
  }
} 

export default {
  getAllUsers,
  getAllPosts,
  changeType,
  getUser,
  getType,
  getOrganization,
  changeOrganization,
  deleteUser,
  createOrganization,
  deleteOrganization,
}