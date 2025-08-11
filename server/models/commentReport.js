export default (sequelize, DataTypes) => {
    return sequelize.define('commentreport', {
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'comments',
              key: 'comment_id'
            }
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id'
            }
          },
          reviewed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          },
    },{
        tableName: 'comments_reports',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            unique: true,
            fields: ['comment_id']
          },
          {
            fields: ['user_id']
          },
          {
            fields: ['reviewed']
          },
          {
            fields: ['createdAt']
          },
          {
            fields: ['reviewed', 'createdAt']
          },
          {
            fields: ['user_id', 'reviewed']
          }
        ]
    });
};