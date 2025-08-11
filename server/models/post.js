export default (sequelize, DataTypes) => {
  return sequelize.define('post', {
    post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: {
          isIn: [['active', 'rejected', 'pending']]
        }
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      reports_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
    }, {
      tableName: 'posts',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['post_id']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['org_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['created_at']
        },
        {
          fields: ['status', 'org_id']
        },
        {
          fields: ['status', 'created_at']
        },
        {
          fields: ['user_id', 'status']
        },
        {
          fields: ['org_id', 'status', 'created_at']
        }
      ]
})
}
