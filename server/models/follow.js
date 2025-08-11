export default (sequelize, DataTypes) => {
    return sequelize.define("follow", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        org_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'organizations',
                key: 'org_id'
            }
        }
    }, {
        tableName: "follows",
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
              unique: true,
              fields: ['user_id', 'org_id']
            },
            {
              fields: ['user_id']
            },
            {
              fields: ['org_id']
            }
        ]
    })
}