import Sequelize, { DataTypes } from 'sequelize';
import createOrganizationEntity from './organization.js';
import createUserEntity from './user.js';
import createPostEntity from './post.js';
import createCommentEntity from './comment.js';
import createPostMediaEntity from "./postMedia.js";
import createLikedPostEntity from "./likedPost.js";
import createLikedCommentEntity from "./likedComment.js";
import createAssignedPostEntity from "./assignedPost.js";
import createBlacklistEntity from "./blacklist.js";
import createPostReportEntity from "./postReport.js";
import createCommentReportEntity from "./commentReport.js";
import createUserPostReportEntity from "./userPostReport.js";
import createUserCommentReportEntity from "./userCommentReport.js";
import createFollowEntity from "./follow.js";
import createNotificationEntity from "./notification.js";
import env from 'dotenv'

env.config()

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});

const Organization = createOrganizationEntity(sequelize, Sequelize.DataTypes);
const User = createUserEntity(sequelize, Sequelize.DataTypes);
const Post = createPostEntity(sequelize, Sequelize.DataTypes);
const Comment = createCommentEntity(sequelize, Sequelize.DataTypes);
const PostMedia = createPostMediaEntity(sequelize, Sequelize.DataTypes);
const LikedPost = createLikedPostEntity(sequelize, Sequelize.DataTypes);
const LikedComment = createLikedCommentEntity(sequelize, Sequelize.DataTypes);
const AssignedPost = createAssignedPostEntity(sequelize, Sequelize.DataTypes);
const Blacklist = createBlacklistEntity(sequelize, Sequelize.DataTypes);
const PostReport = createPostReportEntity(sequelize, Sequelize.DataTypes);
const CommentReport = createCommentReportEntity(sequelize, Sequelize.DataTypes);
const UserPostReport = createUserPostReportEntity(sequelize, Sequelize.DataTypes);
const UserCommentReport = createUserCommentReportEntity(sequelize, Sequelize.DataTypes);
const Follow = createFollowEntity(sequelize, Sequelize.DataTypes);
const Notification = createNotificationEntity(sequelize, Sequelize.DataTypes);

Organization.hasMany(User, {
  foreignKey: 'org_id',
  as: 'users'
});
User.belongsTo(Organization, {
  foreignKey: 'org_id',
  as: 'organization'
});

User.hasMany(Post, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
Post.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

Organization.hasMany(Post, {
  foreignKey: 'org_id',
  onDelete: 'CASCADE',
});
Post.belongsTo(Organization, {
  foreignKey: 'org_id',
  onDelete: 'CASCADE',
});

Post.hasMany(Comment, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
});

Post.hasOne(AssignedPost, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});
AssignedPost.belongsTo(Post, {
  foreignKey: 'post_id'
});

User.hasMany(AssignedPost, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
AssignedPost.belongsTo(User, {
  foreignKey: 'user_id'
});

Post.hasOne(PostReport, {
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});
PostReport.belongsTo(Post, {
  foreignKey: 'post_id'
});

User.hasMany(PostReport, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
PostReport.belongsTo(User, {
  foreignKey: 'user_id'
});

Comment.hasOne(CommentReport, {
  foreignKey: 'comment_id',
  onDelete: 'CASCADE'
});
CommentReport.belongsTo(Comment, {
  foreignKey: 'comment_id'
});

User.hasMany(CommentReport, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
CommentReport.belongsTo(User, {
  foreignKey: 'user_id'
});

User.hasMany(Comment, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

Comment.hasMany(Comment, { 
  as: "Replies", 
  foreignKey: "reply_id",
  onDelete: 'CASCADE',
});

Comment.belongsTo(Comment, { 
  as: "Parent", 
  foreignKey: "reply_id" 
});

Post.hasMany(PostMedia, {
  foreignKey: 'post_id',
});
PostMedia.belongsTo(Post, {
  foreignKey: 'post_id',
});

Post.belongsToMany(User, {
  through: LikedPost,
  foreignKey: 'post_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
});
User.belongsToMany(Post, {
  through: LikedPost,
  foreignKey: 'user_id',
  otherKey: 'post_id',
  onDelete: 'CASCADE',
});

User.belongsToMany(Post, {
  through: UserPostReport,
  foreignKey: 'user_id',
  otherKey: 'post_id',
  onDelete: 'CASCADE',
});
Post.belongsToMany(User, {
  through: UserPostReport,
  foreignKey: 'post_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
});

User.belongsToMany(Comment, {
  through: UserCommentReport,
  foreignKey: 'user_id',
  otherKey: 'comment_id',
  onDelete: 'CASCADE',
});
Comment.belongsToMany(User, {
  through: UserCommentReport,
  foreignKey: 'comment_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
});

Comment.belongsToMany(User, {
  through: LikedComment,
  foreignKey: 'comment_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE',
});
User.belongsToMany(Comment, {
  through: LikedComment,
  foreignKey: 'user_id',
  otherKey: 'comment_id',
  onDelete: 'CASCADE',
});

User.hasOne(Blacklist, {
  foreignKey: 'email',
  sourceKey: 'email',
  onDelete: 'CASCADE'
});
Blacklist.belongsTo(User, {
  foreignKey: 'email',
  targetKey: 'email'
});

User.belongsToMany(Organization, {
through: Follow,
foreignKey: 'user_id',
otherKey: 'org_id'
});

Organization.belongsToMany(User, {
through: Follow,
foreignKey: 'org_id',
otherKey: 'user_id'
});

User.hasMany(Follow, {
foreignKey: 'user_id',
onDelete: 'CASCADE'
});

Follow.belongsTo(User, {
foreignKey: 'user_id'
});

Organization.hasMany(Follow, {
foreignKey: 'org_id',
onDelete: 'CASCADE'
});

Follow.belongsTo(Organization, {
foreignKey: 'org_id'
});

User.hasMany(Notification, {
foreignKey: 'user_id',
onDelete: 'CASCADE'
});

Notification.belongsTo(User, {
foreignKey: 'user_id',
as: 'recipient'
});

Notification.belongsTo(User, {
foreignKey: 'sender_id',
as: 'sender'
});

Post.hasMany(Notification, {
foreignKey: 'post_id',
onDelete: 'CASCADE'
});

Notification.belongsTo(Post, {
foreignKey: 'post_id'
});

Comment.hasMany(Notification, {
foreignKey: 'comment_id',
onDelete: 'CASCADE'
});

Notification.belongsTo(Comment, {
foreignKey: 'comment_id'
});

Post.hasMany(Follow, {
foreignKey: 'org_id',
sourceKey:  'org_id',
});
Follow.belongsTo(Post, {
foreignKey: 'org_id',
targetKey:  'org_id',
});

try {
  await sequelize.authenticate();
  
  // await sequelize.sync({ alter: true }); 
  
} catch (err) {
  console.error('Database connection failed:', err.message);
  console.warn(err);
}

export default {
  sequelize,
  Organization,
  User,
  Post,
  Comment,
  LikedPost,
  LikedComment,
  PostMedia,
  AssignedPost,
  Blacklist,
  PostReport,
  CommentReport,
  UserPostReport,
  UserCommentReport,
  Follow,
  Notification,
};