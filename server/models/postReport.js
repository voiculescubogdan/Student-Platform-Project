export default (sequelize, DataTypes) => {
    return sequelize.define('postreport', {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'posts',
              key: 'post_id'
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
        tableName: 'posts_reports',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            unique: true,
            fields: ['post_id'] 
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