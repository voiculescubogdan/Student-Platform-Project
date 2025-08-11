export default (sequelize, DataTypes) => {
    return sequelize.define("notification", {
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        type: {
            type: DataTypes.ENUM('new_post', 'comment', 'reply', 'status_change', 'like', 'report', 'pending_post'),
            allowNull: false
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'posts',
                key: 'post_id'
            }
        },
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'comments',
                key: 'comment_id'
            }
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: "notifications",
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
              fields: ['user_id']
            },
            {
              fields: ['read']
            },
            {
              fields: ['createdAt']
            },
            {
              fields: ['user_id', 'read']
            },
            {
              fields: ['user_id', 'createdAt']
            },
            {
              fields: ['post_id']
            },
            {
              fields: ['comment_id']
            },
            {
              fields: ['sender_id']
            }
        ]
    });
};