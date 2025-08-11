import models from "../../models/index.js";
import utils from "../../utils/index.js";

async function getNotifications(req, res, next) {
    try {
        const userId = req.user.user_id;
        
        const notifications = await models.Notification.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: models.User,
                    as: 'sender',
                    attributes: ['user_id', 'username']
                },
                {
                    model: models.Post,
                    attributes: ['post_id', 'title'],
                    required: false,
                },
                {
                    model: models.Comment,
                    attributes: ['comment_id', 'comment_text'],
                    required: false,
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications
        });
    } catch (error) {
        console.error("Error retrieving notifications:", error);
        res.status(500).json({
            message: "Error retrieving notifications",
            error: error.message
        });
    }
}

async function markAsRead(req, res, next) {
    try {
        const userId = req.user.user_id;
        const notificationId = req.params.nid;
        
        if (notificationId) {
            const notification = await models.Notification.findOne({
                where: {
                    notification_id: notificationId,
                    user_id: userId
                }
            });
            
            if (!notification) {
                return res.status(404).json({
                    message: "Notification not found or you don't have permission"
                });
            }
            
            if (!notification.read) {
                notification.read = true;
                await notification.save();
                
                await models.User.decrement('notifications_count', {
                    where: { user_id: userId },
                    by: 1
                });
            }
            
            res.status(200).json({
                message: "Notification marked as read"
            });
        } else {
            const success = await utils.markAllNotificationsAsRead(userId, models);
            
            if (success) {
                res.status(200).json({
                    message: "All notifications marked as read"
                });
            } else {
                throw new Error("Failed to mark notifications as read");
            }
        }
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({
            message: "Error marking notifications as read",
            error: error.message
        });
    }
}

export default {
    getNotifications,
    markAsRead
};