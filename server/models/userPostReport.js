export default (sequelize, DataTypes) => {
    return sequelize.define('userpostreport', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'users',
              key: 'user_id'
            }
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'posts',
              key: 'post_id'
            }
          },
    },{
        tableName: 'users_posts_reports',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'post_id']
          },
          {
            fields: ['user_id']
          },
          {
            fields: ['post_id']
          },
          {
            fields: ['createdAt']
          },
          {
            fields: ['user_id', 'createdAt']
          }
        ]
    });
};