export default (sequelize, DataTypes) => {
    return sequelize.define('usercommentreport', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'users',
              key: 'user_id'
            }
        },
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'comments',
              key: 'comment_id'
            }
          },
    },{
        tableName: 'users_comments_reports',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'comment_id']
          },
          {
            fields: ['user_id']
          },
          {
            fields: ['comment_id']
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