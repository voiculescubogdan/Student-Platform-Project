export default (sequelize, DataTypes) => {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          org_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
          },
          email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
          },
          password: {
            type: DataTypes.STRING(255),
            allowNull: false
          },
          token: DataTypes.TEXT,
          user_type: {
            type: DataTypes.STRING(20),
            defaultValue: 'Student',
            validate: {
              isIn: [['Student', 'Membru', 'Moderator', 'Administrator']]
            }
          },
          notifications_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
          },
          confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          confirmation_token: {
            type: DataTypes.STRING(255),
            allowNull: true
          },
          confirmation_token_expires: {
            type: DataTypes.DATE,
            allowNull: true
          }
        }, {
          tableName: 'users',
          timestamps: false,
          indexes: [
            {
              unique: true,
              fields: ['email']
            },
            {
              unique: true,
              fields: ['username']
            },
            {
              fields: ['org_id']
            },
            {
              fields: ['user_type']
            },
            {
              fields: ['confirmed']
            },
            {
              fields: ['confirmation_token']
            },
            {
              fields: ['org_id', 'user_type']
            }
          ]
    })
}