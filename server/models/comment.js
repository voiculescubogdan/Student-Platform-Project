export default (sequelize, DataTypes) => {
    return sequelize.define('comment', {
        comment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          post_id: {
            type: DataTypes.INTEGER, 
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER, 
            allowNull: false
          },
          reply_id: {
            type: DataTypes.INTEGER, 
            allowNull: true
          },
          comment_text: {
            type: DataTypes.TEXT,
            allowNull: false
          },
          likes_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          reports_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
          },
        }, {
          tableName: 'comments',
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          indexes: [
            {
              fields: ['post_id']
            },
            {
              fields: ['user_id']
            },
            {
              fields: ['reply_id']
            },
            {
              fields: ['created_at']
            },
            {
              fields: ['post_id', 'created_at']
            },
            {
              fields: ['post_id', 'reply_id']
            },
            {
              fields: ['comment_id'],
              unique: true
            },
            {
              fields: ['user_id', 'created_at']
            },
            {
              fields: ['likes_count']
            }
          ]
    })
}