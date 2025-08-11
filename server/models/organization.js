export default (sequelize, DataTypes) => {
    return sequelize.define('organization', {
        org_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          description: DataTypes.TEXT,
          members_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
          }
        }, {
          tableName: 'organizations',
          timestamps: false,
          indexes: [
            {
              unique: true,
              fields: ['name']
            },
            {
              fields: ['members_count']
            }
          ]
    })
            
}