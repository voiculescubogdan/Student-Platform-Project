export default (sequelize, DataTypes) => {
    return sequelize.define("blacklist", {
        email: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'email'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          },
    }, {
        tableName: "blacklist",
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
              unique: true,
              fields: ['email']
            },
            {
              fields: ['createdAt']
            }
        ]
    })
}