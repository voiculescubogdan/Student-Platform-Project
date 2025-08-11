import utils from "./index.js";

export async function checkAndCreateReport(itemId, type, orgId, models) {
    try {
      const ItemModel = type === 'post' ? models.Post : models.Comment;
      const ReportModel = type === 'post' ? models.PostReport : models.CommentReport;
      const idField = type === 'post' ? 'post_id' : 'comment_id';
      
      const item = await ItemModel.findByPk(itemId);
      
      if (!item || item.reports_count < 5) {
        return false;
      }
      
      const existingReport = await ReportModel.findOne({
        where: {
          [idField]: itemId
        }
      });
      
      if (existingReport) {
        return false;
      }
      
      const moderators = await models.User.findAll({
        where: {
          org_id: orgId,
          user_type: 'Moderator'
        }
      });
      
      if (!moderators.length) {
        return false;
      }
      
      const randomIndex = Math.floor(Math.random() * moderators.length);
      const selectedModerator = moderators[randomIndex];
      
      await ReportModel.create({
        [idField]: itemId,
        user_id: selectedModerator.user_id,
        reviewed: false
      });

      await utils.createModeratorReportNotification(
        selectedModerator.user_id,
        type,
        itemId,
        models
    );
      
      return true;
    } catch (error) {
      console.error(`Error creating report for ${type} ${itemId}:`, error);
      return false;
    }
  }