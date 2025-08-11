export async function createNotification(data, models) {
    try {
        if (!data.user_id || !data.type || !data.content) {
            throw new Error('Missing required notification data');
        }
        
        const result = await models.sequelize.transaction(async (t) => {
            const notification = await models.Notification.create(data, { transaction: t });
            
            await models.User.increment('notifications_count', {
                where: { user_id: data.user_id },
                transaction: t
            });
            
            return notification;
        });
        
        return result;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

export async function createPostNotifications(post, models) {
    try {
        const followers = await models.Follow.findAll({
            where: { org_id: post.org_id }
        });
        
        const organization = await models.Organization.findByPk(post.org_id);
        
        if (!organization || followers.length === 0) {
            return;
        }

        for (const follower of followers) {
            if (follower.user_id !== post.user_id) {
                createNotification({
                    user_id: follower.user_id,
                    type: 'new_post',
                    post_id: post.post_id,
                    sender_id: post.user_id,
                    content: `O nouă postare a fost creată în ${organization.name}`
                }, models).catch(error => {
                    console.error('Eroare la trimiterea notificării:', error);
                });
            }
        }
        
        console.log(`Se trimit ${followers.length} notificări pentru postarea ${post.post_id}`);
        
    } catch (error) {
        console.error('Error creating post notifications:', error);
    }
}

export async function createCommentNotification(comment, models) {
    try {
        const post = await models.Post.findByPk(comment.post_id, {
            attributes: ['user_id']
        });
        
        if (post && post.user_id !== comment.user_id) {
            let username;
            if (comment.username) {
                username = comment.username;
            } else {
                const commentAuthor = await models.User.findByPk(comment.user_id, {
                    attributes: ['username']
                });
                username = commentAuthor.username;
            }
            
            await createNotification({
                user_id: post.user_id,
                type: 'comment',
                post_id: post.post_id,
                comment_id: comment.comment_id,
                sender_id: comment.user_id,
                content: `${username} a comentat la postarea ta`
            }, models);
        }
    } catch (error) {
        console.error('Error creating comment notification:', error);
    }
}

export async function createReplyNotification(reply, models) {
    try {
        const parentComment = await models.Comment.findByPk(reply.reply_id, {
            attributes: ['user_id']
        });
        
        if (parentComment && parentComment.user_id !== reply.user_id) {
            let username;
            if (reply.username) {
                username = reply.username;
            } else {
                const replyAuthor = await models.User.findByPk(reply.user_id, {
                    attributes: ['username']
                });
                username = replyAuthor.username;
            }
            
            await createNotification({
                user_id: parentComment.user_id,
                type: 'reply',
                post_id: reply.post_id,
                comment_id: reply.comment_id,
                sender_id: reply.user_id,
                content: `${username} a răspuns la comentariul tău`
            }, models);
        }
    } catch (error) {
        console.error('Error creating reply notification:', error);
    }
}

export async function createStatusChangeNotification(post, oldStatus, models) {
    try {
        if (post.user_id) {
            await createNotification({
                user_id: post.user_id,
                type: 'status_change',
                post_id: post.post_id,
                content: `Statusul postării tale a fost schimbat din ${oldStatus} în ${post.status}`
            }, models);
        }
    } catch (error) {
        console.error('Error creating status change notification:', error);
    }
}

export async function createLikeNotification(likeData, type, models) {
    try {
        if (type === 'post') {
            const post = await models.Post.findByPk(likeData.post_id, {
                attributes: ['user_id']
            });
            
            if (post && post.user_id !== likeData.user_id) {
                await createNotification({
                    user_id: post.user_id,
                    type: 'like',
                    post_id: likeData.post_id,
                    sender_id: likeData.user_id,
                    content: `${likeData.username} a apreciat postarea ta`
                }, models);
            }
        } else if (type === 'comment') {
            const comment = await models.Comment.findByPk(likeData.comment_id, {
                attributes: ['user_id', 'post_id']
            });
            
            if (comment && comment.user_id !== likeData.user_id) {
                await createNotification({
                    user_id: comment.user_id,
                    type: 'like',
                    comment_id: likeData.comment_id,
                    post_id: comment.post_id,
                    sender_id: likeData.user_id,
                    content: `${likeData.username} a apreciat comentariul tău`
                }, models);
            }
        }
    } catch (error) {
        console.error('Eroare la crearea notificării de like:', error);
    }
}

export async function markAllNotificationsAsRead(userId, models) {
    try {
        await models.Notification.update(
            { read: true },
            { 
                where: { 
                    user_id: userId,
                    read: false
                }
            }
        );
        
        await models.User.update(
            { notifications_count: 0 },
            { where: { user_id: userId } }
        );
        
        return true;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return false;
    }
}

export async function createModeratorReportNotification(moderatorId, type, contentId, models) {
    try {
        const contentType = type === 'post' ? 'postarea' : 'comentariul';
        const idField = type === 'post' ? 'post_id' : 'comment_id';
        
        const Model = type === 'post' ? models.Post : models.Comment;
        const content = await Model.findByPk(contentId);
        if (!content) return;
        
        await createNotification({
            user_id: moderatorId,
            type: 'report',
            [idField]: contentId,
            content: `Un nou raport pentru ${contentType} #${contentId} necesită atenția ta`
        }, models);
    } catch (error) {
        console.error('Error creating moderator report notification:', error);
    }
}

export async function createNewPostForModerationNotification(post, models) {
    try {
        const assignedPost = await models.AssignedPost.findOne({
            where: { post_id: post.post_id }
        });
        
        if (!assignedPost) {
            console.error(`Nu există un moderator asignat pentru postarea ${post.post_id}`);
            return;
        }
        
        const moderatorId = assignedPost.user_id;
        
        const moderator = await models.User.findOne({
            where: {
                user_id: moderatorId,
                user_type: 'Moderator'
            }
        });
        
        if (!moderator) {
            console.error(`Utilizatorul ${moderatorId} nu este moderator sau nu există`);
            return;
        }
        
        await createNotification({
            user_id: moderatorId,
            type: 'pending_post',
            post_id: post.post_id,
            sender_id: post.user_id,
            content: `O nouă postare "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}" necesită aprobarea ta`
        }, models);
        
    } catch (error) {
        console.error('Error creating new post for moderation notification:', error);
    }
}