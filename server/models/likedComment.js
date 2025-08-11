export default (sequelize, DataTypes) => {
    return sequelize.define('likedComment', {
        comment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'comments',
              key: 'comment_id'
            }
          },
          user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'users',
              key: 'user_id'
            }
          },
          liked_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
          }
        }, {
          tableName: 'liked_comments',
          timestamps: false,
          indexes: [
            {
              unique: true,
              fields: ['user_id', 'comment_id']
            },
            {
              fields: ['comment_id']
            },
            {
              fields: ['user_id']
            },
            {
              fields: ['liked_at']
            }
          ]
    })
}