import models from '../../models/index.js'
import bcrypt from "bcrypt";
import utils from "../../utils/index.js"

async function getUser(req, res, next) {
  try {
    const userId = req.params.uid;

    const user = await models.User.findOne({
      where: { user_id: userId },
      include: [
        {
          model: models.Organization,
          as: 'organization',
          attributes: ['org_id', 'name', 'description', 'members_count'],
          required: false
        }
      ],
      attributes: {
        exclude: ['password', 'token', 'confirmation_token']
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const userWithBanStatus = await utils.addBanStatus(user, models);

    res.status(200).json({
      message: "User retrieved successfully!",
      user: userWithBanStatus
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({
      message: "Error getting user: " + err.message,
    });
  }
}

async function getUserPosts(req, res, next) {
  try {
    const { page = 1, limit = 5, sort = 'DESC', ...otherFilters } = req.query;
    const userId = req.params.uid;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const sortOrder = (sort && sort.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const cleanFilters = {};
    Object.keys(otherFilters).forEach(key => {
      const value = otherFilters[key];
      if (value !== '' && value !== null && value !== undefined) {
        if (key === 'org_id') {
          const orgId = parseInt(value, 10);
          if (!isNaN(orgId)) {
            cleanFilters[key] = orgId;
          }
        } else {
          cleanFilters[key] = value;
        }
      }
    });

    const posts = await models.Post.findAll({
      where: {
        user_id: userId,
        status: 'active',
        ...cleanFilters
      },
      include: [
        {
          model: models.User,
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: models.Organization,
          attributes: ['org_id', 'name'],
          required: false
        },
        {
          model: models.PostMedia,
          required: false
        }
      ],
      order: [['created_at', sortOrder]],
      limit: limitNum + 1,
      offset: offset
    });

    const hasNext = posts.length > limitNum;
    const actualPosts = hasNext ? posts.slice(0, limitNum) : posts;

    const totalPostsCount = await models.Post.count({
      where: {
        user_id: userId,
        status: 'active'
      }
    });

    res.status(200).json({
      message: "User posts retrieved successfully!",
      posts: actualPosts,
      totalPostsCount,
      pagination: {
        currentPage: pageNum,
        hasNextPage: hasNext,
        hasPrevPage: pageNum > 1,
        totalPosts: totalPostsCount
      }
    });
  } catch (err) {
    console.error('Error getting user posts:', err);
    res.status(500).json({
      message: "Error getting user posts: " + err.message,
    });
  }
}

async function editCurrentUser(req, res, next) {
  try {
    const user = req.user;

    let newUsername = req.body.username;

    if (!newUsername || newUsername.trim() === "") {
      newUsername = user.username;
    }

    await models.User.update({
      username: newUsername,
    }, {
      where: {
        user_id: user.user_id
      }
    })

    res.status(200).json({
      message: "User edited successfully!"
    })
  } catch (err) {
    res.status(500).json({
      message: "Error editing profile\n" + err,
    })
  }
}

const saltRounds = 10;

async function changePassword(req, res, next) {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (newPassword === oldPassword) {
      return res.status(400).json({ message: "Same password!" });
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Password do not match!" });
    }

    const hash = await bcrypt.hash(newPassword, saltRounds);

    await models.User.update(
      { password: hash },
      { where: { user_id: user.user_id } }
    );

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    return res.status(500).json({
      message: "Error changing password!\n" + err.message,
    });
  }
}

async function getFollowedOrganizations(req, res) {
  try {
    const userId = req.user.user_id;
    
    const followedOrganizations = await models.Organization.findAll({
      include: [{
        model: models.Follow,
        where: { user_id: userId },
        attributes: [],
        required: true
      }]
    });
    
    res.status(200).json({
      message: "Organizații urmărite obținute cu succes",
      organizations: followedOrganizations
    });
  } catch (err) {
    res.status(500).json({
      message: "Eroare la obținerea organizațiilor urmărite",
      error: err.message
    });
  }
}

async function getAllOrganizations(req, res, next) {
  try {
    const organizations = await models.Organization.findAll();

    if(!organizations) {
      return res.status(200).json({message: "Nu exista organizatii!"})
    }

    res.status(200).json({message: "Organizatii afisate cu succes!", organizations})
  } catch (err) {
    res.status(500).json({message: "Error getting organizations! " + err,})
  }
}

async function getOrganization(req, res, next) {
  try {

    const orgId = req.params.oid;

    const organization = await models.Organization.findOne({
      where: {
        org_id: orgId,
      }
    })

    if(!organization) {
      return res.status(401).json({message: "Organization doesn't exist!"})
    }

    return res.status(200).json({message: "Organization showed successfully!", organization});

  } catch (err) {
    res.status(500).json({message: "Error getting organization! ", err})
  }
}

export default {
  getUser,
  getUserPosts,
  editCurrentUser,
  changePassword,
  getFollowedOrganizations,
  getAllOrganizations,
  getOrganization,
}