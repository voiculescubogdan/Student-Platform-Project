export default (sequelize, DataTypes) => {
  return sequelize.define('assignedpost', {
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'assignedposts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['post_id']
      },
      {
        fields: ['user_id']
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
