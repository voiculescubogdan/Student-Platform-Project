export default (sequelize, DataTypes) => {
    return sequelize.define('likedPost', {
        post_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'posts',
              key: 'post_id'
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
          tableName: 'liked_posts',
          timestamps: false,
          indexes: [
            {
              unique: true,
              fields: ['user_id', 'post_id']
            },
            {
              fields: ['post_id']
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