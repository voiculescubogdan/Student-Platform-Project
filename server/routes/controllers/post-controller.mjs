import models from "../../models/index.js";
import { Op } from "sequelize";
import utils from "../../utils/index.js"

async function createPost(req, res, next) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const user = req.user;

    const newPost = await models.Post.create({
      title: title,
      description: description,
      user_id: user.user_id,
      org_id: user.org_id
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await models.PostMedia.create({
          post_id: newPost.post_id,
          media_url: file.path,
          media_type: file.mimetype
        });
      }
    }

    if(user.user_type === "Membru") {
      const moderators = await models.User.findAll({
        where: {
          user_type: "Moderator",
          org_id: user.org_id,
        }
      });
  
      if(moderators.length === 0) {
        return res.status(400).json({ message: 'Nu există moderatori disponibili' });
      } 
  
      const randomModerator = moderators[Math.floor(Math.random() * moderators.length)];
  
      await models.AssignedPost.create({
        post_id: newPost.post_id,
        user_id: randomModerator.user_id,
      });

      setImmediate(async () => {
        await utils.createNewPostForModerationNotification(newPost, models);
      });

      return res.status(201).json({
        message: 'Postare creată si asignată cu succes!',
        post: newPost
      });
    }

    await models.Post.update(
      { status: "active" },
      { where: { post_id: newPost.post_id } }
    );

    const activePost = await models.Post.findByPk(newPost.post_id);

    setImmediate(async () => {
      await utils.createPostNotifications(activePost, models);
    });

    res.status(201).json({
      message: 'Postare creată cu succes!',
      post: activePost,
    });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la creare postare.\n' + err });
  }
}

async function getAllFollowedOrganizationsPosts(req, res, next) {
  try {
    const followsCount = await models.Follow.count({
      where: { user_id: req.user.user_id }
    });

    if (followsCount === 0) {
      return res.status(200).json({
        message: 'Nu urmărești nicio organizație!',
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    const { org_ids, page = 1, limit = 5, sort = 'DESC', ...otherFilters } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const sortOrder = (sort && sort.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const whereClause = {
      status: "active",
      ...otherFilters
    };

    if (org_ids) {
      const orgIdsArray = Array.isArray(org_ids) ? org_ids : [org_ids];
      whereClause.org_id = {
        [Op.in]: orgIdsArray
      };
    }

    const totalCount = await models.Post.count({
      where: whereClause,
      include: [
        {
          model: models.Follow,
          where: { user_id: req.user.user_id },
          attributes: [],
          required: true
        },
        {
          model: models.User,
          attributes: [],
          required: true
        },
        {
          model: models.Organization,
          as: 'organization',
          attributes: [],
          required: true
        }
      ]
    });

    const posts = await models.Post.findAll({
      where: whereClause,
      include: [
        {
          model: models.Follow,
          where: { user_id: req.user.user_id },
          attributes: [],
          required: true
        },
        {
          model: models.User,
          attributes: ['user_id','username','email'],
          required: true
        },
        {
          model: models.Organization,
          as: 'organization',
          attributes: ['org_id', 'name'],
          required: true
        },
        {
          model: models.PostMedia,
          as: 'postmedia',
          attributes: ['media_id','media_url','media_type']
        }
      ],
      order: [['created_at', sortOrder]],
      limit: limitNum,
      offset: offset
    })

    if (!posts.length && pageNum === 1) {
      return res.status(200).json({ 
        message: 'Nu există postări de la organizaţiile urmărite', 
        posts: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      })
    }

    const formatted = await utils.formatBannedUsernames(posts, models)

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({ 
      message: 'OK', 
      posts: formatted,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    })
  } catch (err) {
    console.error('Error in getAllFollowedOrganizationsPosts:', err)
    return res.status(500).json({ message: 'Error getting followed posts', err: err.message })
  }
}

async function getAllActivePosts(req, res, next) {
  try {
    const { org_ids, page = 1, limit = 5, sort = 'DESC', ...otherFilters } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const sortOrder = (sort && sort.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const whereClause = {
      status: "active",
      ...otherFilters
    };

    if (org_ids) {
      const orgIdsArray = Array.isArray(org_ids) ? org_ids : [org_ids];
      whereClause.org_id = {
        [Op.in]: orgIdsArray
      };
    }

    const totalCount = await models.Post.count({
      where: whereClause,
      include: [
        {
          model: models.User,
          attributes: [],
          required: true
        },
        {
          model: models.Organization,
          as: 'organization',
          attributes: [],
          required: true
        }
      ]
    });

    const posts = await models.Post.findAll({
      where: whereClause,
      include: [
      {
        model: models.User,
        attributes: ['user_id', 'username','email'],
        required: true
      },
      {
        model: models.Organization,
        as: 'organization',
        attributes: ['org_id', 'name'],
        required: true
      },
      {
        model: models.PostMedia,
        as: 'postmedia',
        attributes: ['media_id','media_url','media_type']
      }],
      order: [['created_at', sortOrder]],
      limit: limitNum,
      offset: offset
    });

    if (!posts.length && pageNum === 1) {
      return res.status(200).json({ 
        message: 'Nu există postări!', 
        posts: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      })
    }

    const formattedPosts = await utils.formatBannedUsernames(posts, models);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      message: "Acestea sunt toate postarile active",
      posts: formattedPosts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    })
  } catch (err) {
    console.error('Error in getAllActivePosts:', err);
    res.status(500).json({
      message: "Eroare la afisarea tuturor postarilor: \n" + err,
    })
  }
}

async function getOrganizationPosts(req, res, next) {
  try {
    const { oid } = req.params;
    const { page = 1, limit = 5, sort = 'DESC' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const sortOrder = (sort && sort.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    
    const organization = await models.Organization.findByPk(oid);
    if (!organization) {
      return res.status(404).json({ 
        message: "Organizația nu a fost găsită" 
      });
    }

    const totalCount = await models.Post.count({
      where: {
        org_id: oid,
        status: 'active'
      }
    });

    const posts = await models.Post.findAll({
      where: {
        org_id: oid,
        status: 'active'
      },
      include: [
        {
          model: models.User,
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: models.Organization,
          as: 'organization',
          attributes: ['org_id', 'name']
        },
        {
          model: models.PostMedia,
          as: 'postmedia',
          attributes: ['media_id', 'media_url', 'media_type']
        }
      ],
      order: [['created_at', sortOrder]], 
      limit: limitNum,
      offset: offset
    });

    const isFollowing = await models.Follow.findOne({
      where: {
        user_id: req.user.user_id,
        org_id: oid
      }
    });

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      message: "Postările organizației au fost preluate cu succes",
      posts: posts,
      organization: organization,
      isFollowing: !!isFollowing,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error("Eroare la preluarea postărilor organizației:", err);
    res.status(500).json({ 
      message: "Eroare la preluarea postărilor organizației" 
    });
  }
};

async function getPost(req, res, next) {
  try {
    const pid = req.params.pid;
    
    const post = await models.Post.findOne({
      where: {
        post_id: pid,
      },
      include: [
      {
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      },
      {
        model: models.Organization,
        as: 'organization',
        attributes: ['org_id', 'name'],
        required: true
      },
      {
        model: models.PostMedia,
        as: 'postmedia',
        attributes: ['media_id','media_url','media_type']
      }]
    })

    const formattedPost = await utils.formatBannedUsernames(post, models);

    const user = await models.User.findOne({
      where: {
        user_id: req.user.user_id,
      }
    })

    let isAssigned = false;

    if (user.user_type === "Moderator" || user.user_type === "Administrator") {
      const assignedPost = await models.AssignedPost.findOne({
        where: {
          post_id: pid,
          user_id: req.user.user_id
        }
      });
      
      isAssigned = !!assignedPost;
    }

    if(post.status === "pending") {

      if((user.user_type === "Moderator" && user.org_id === post.org_id) || user.user_type === "Administrator") {

        return res.status(200).json({message: "Hidden Post Showed!",post: formattedPost, isAssigned: isAssigned})

      } else {
        return res.status(403).json({message: "You don't have permission!"})
      }

    } else if (post.status === "rejected") {
      return res.status(404).json({message: "Post was rejected"})
    }

    res.status(200).json({message: "Post Showed!", post : formattedPost, isAssigned: isAssigned});
    
  } catch (err) {
    res.status(500).json({
      message: "Error getting post\n" + err,
    })
  }
}

async function editPost(req, res, next) {
  try {
    const pid = req.params.pid;
    let newTitle = req.body.title;
    let newDescription = req.body.description;
    let removedMediaIds = req.body.removedMediaIds;
    
    if (removedMediaIds && typeof removedMediaIds === 'string') {
      try {
        removedMediaIds = JSON.parse(removedMediaIds);
      } catch (parseError) {
        console.log('Eroare la parsarea removedMediaIds:', parseError);
        removedMediaIds = [];
      }
    }
    
    if (!Array.isArray(removedMediaIds)) {
      removedMediaIds = [];
    }

    const post = await models.Post.findOne({
      where: {
        post_id: pid,
      }
    })

    if(!post) {
      return res.status(404).json({message: "Post doesn't exist!"})
    }

    const user = await models.User.findOne({
      where: {
        user_id: req.user.user_id,
      }
    })

    if(user.user_type === "Membru") {
      if(user.user_id !== post.user_id) {
        return res.status(403).json({message: "You don't have permission! Not the same user!"})
      }
    }

    if(user.user_type === "Moderator") {
      if(user.org_id !== post.org_id) {
        return res.status(403).json({message: "You don't have permission in this organization!"})
      }
    }

    if(post.status === "pending") {
      return res.status(500).json({message: "Post is in pending, cannot edit!"})
    }

    if(post.status === "rejected") {
      return res.status(500).json({message: "Post is rejected, cannot edit!"})
    }

    if(!newTitle || newTitle.trim() === "") {
      newTitle = post.title;
    }

    if(!newDescription || newDescription.trim() === "") {
      newDescription = post.description;
    }

    await models.Post.update(
      {
        title: newTitle,
        description: newDescription,
      }
      ,{
        where: {
          post_id: post.post_id,
        }
      }
    );

    if (removedMediaIds && removedMediaIds.length > 0) {
      await models.PostMedia.destroy({
        where: {
          media_id: { [Op.in]: removedMediaIds },
          post_id: post.post_id,
        },
        individualHooks: true,
      });
    }

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        await models.PostMedia.create({
          post_id: post.post_id,
          media_url: file.path,
          media_type: file.mimetype
        });
      }
    }

    res.status(200).json({
      message: "Post edited with success!",
      post,
    })

  } catch (err) {
    res.status(500).json({
      message: "Post could not be edited\n" + err,
    })
  }
}

async function deleteMediaPost(pid) {

  if (!pid) return;

  await models.PostMedia.destroy({
    where: { post_id: pid },
    individualHooks: true,
  });
}

async function deletePost(req, res, next) {
  try {
    const pid = req.params.pid;

    const post = await models.Post.findOne({
      where: {
        post_id: pid,
      }
    })

    if(!post) {
      return res.status(404).json({message: "Post doesn't exist!"})
    }

    if(req.user.user_id === post.user_id || (req.user.user_type === "Moderator" && req.user.org_id === post.org_id) || req.user.user_type === "Administrator") {

      await deleteMediaPost(post.post_id);
  
      await models.Post.destroy({
        where: {
          post_id: post.post_id,
        },
        individualHooks: true,
      })

      await models.AssignedPost.destroy({
        where: {
          post_id: post.post_id,
        }
      })
  
      return res.status(200).json({ message: "Post deleted with success!",})

    } else {
        return res.status(403).json({ message: "You don't have permission!",})
    }

  } catch (err) {
    res.status(500).json({
      message: "Post could not be deleted\n" + err,
    })
  }
}

async function sortPosts(req, res, next) {
  try {
    const sortParam = (req.query.sort || "ASC").toUpperCase();
    const sort = sortParam === "ASC" ? "ASC" : "DESC";

    const posts = await models.Post.findAll({
      order: [['created_at', sort]],
      where: {
        status: "active",
      },
      include: [{
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      }]
    });
    
    const formattedPosts = await utils.formatBannedUsernames(posts, models);

    res.status(200).json({
      message: "Posts sorted successfully!",
      posts: formattedPosts,
    })
  } catch (err) {
    res.status(500).json({
      message: "Posts could not be sorted\n" + err,
    })
  }
}

async function filterPosts(req, res, next) {
  try {
    const oid = req.params.oid;

    const posts = await models.Post.findAll({
      where: {
        org_id: oid,
        status: "active",
      },
      include: [{
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      }]
    })

    const formattedPosts = await utils.formatBannedUsernames(posts, models);

    res.status(200).json({
      message: "Posts filtered successfully!",
      posts: formattedPosts,
    })
  } catch (err) {
    res.status(500).json({
      message: "Error filtering posts\n" + err,
    })
  }
}

async function sortFilteredPosts(req, res, next) {
  try {
    const oid = req.params.oid;
    const sortParam = (req.query.sort || "ASC").toUpperCase();
    const sort = (sortParam === "ASC" ? "ASC" : "DESC");

    const posts = await models.Post.findAll({
      where: { org_id: oid, status: "active", },
      order: [['created_at', sort]],
      include: [{
        model: models.User,
        attributes: ['user_id', 'username', 'email'],
        required: true
      }]
    });

    const formattedPosts = await utils.formatBannedUsernames(posts, models);

    res.status(200).json({
      message: "Posts filtered and sorted successfully!",
      posts: formattedPosts,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error filtering/sorting posts: " + err.message,
    });
  }
}

export default {
  createPost,
  getAllFollowedOrganizationsPosts,
  getAllActivePosts,
  getPost,
  editPost,
  deletePost,
  sortPosts,
  filterPosts,
  sortFilteredPosts,
  getOrganizationPosts,
}
