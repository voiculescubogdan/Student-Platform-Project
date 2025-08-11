import fs from "fs";
import path from "path";

export default (sequelize, DataTypes) => {
    const PostMedia = sequelize.define('postmedia', {
        media_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          post_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          media_type: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          media_url: {
            type: DataTypes.TEXT,
            allowNull: false
          }
        }, {
          tableName: 'postsmedia',
          timestamps: false,
          indexes: [
            {
              fields: ['post_id']
            },
            {
              fields: ['media_type']
            },
            {
              fields: ['media_id'],
              unique: true
            },
            {
              fields: ['media_url'],
              unique: true
            },
            {
              fields: ['post_id', 'media_type'],
              name: 'idx_post_media_type'
            }
          ]
    })

    PostMedia.addHook('afterDestroy', (media, options) => {
      const filePath = path.join(process.cwd(), media.media_url);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Eroare la ștergerea fișierului ${filePath}:`, err);
        }
      });
    });

    return PostMedia;
}