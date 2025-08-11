import models from "../../models/index.js";
import utils from "../../utils/index.js"

async function reportPost(req, res, next) {
    try {
      const postId = req.params.pid;
      const userId = req.user.user_id;
      
      const post = await models.Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Postarea nu a fost găsită" });
      }
      
      const existingUserReport = await models.UserPostReport.findOne({
        where: {
          post_id: postId,
          user_id: userId
        }
      });
      
      if (existingUserReport) {
        return res.status(400).json({ message: "Ai raportat deja această postare" });
      }

      const user = await models.User.findOne({
        where: {
          user_id: userId,
        }
      })

      if(user.user_id === post.user_id) {
        return res.status(400).json({message: "Nu iti poti raporta propria postare!"})
      }

      post.reports_count += 1;
      await post.save();

      await models.UserPostReport.create({
        post_id: postId,
        user_id: userId
      });
      
      await utils.checkAndCreateReport(postId, 'post', post.org_id, models);
      
      res.status(200).json({ message: "Postare raportată cu succes" });
    } catch (error) {
      res.status(500).json({ message: "Eroare la raportarea postării ", error });
    }
  }

async function reportComment(req, res, next) {
    try {
        const postId = req.params.pid;
        const commentId = req.params.cid;
        const userId = req.user.user_id;
        
        const comment = await models.Comment.findOne({
            where: {
                post_id: postId,
                comment_id: commentId,
            },
            include: [{
                model: models.Post,
                attributes: ['org_id', 'post_id']
            }]
        });
        if (!comment) {
        return res.status(404).json({ message: "Comentariul nu a fost gasit" });
        }

        const existingUserReport = await models.UserCommentReport.findOne({
          where: {
            comment_id: commentId,
            user_id: userId
          }
        });
        
        if (existingUserReport) {
          return res.status(400).json({ message: "Ai raportat deja acest comentariu!" });
        }

        const user = await models.User.findOne({
          where: {
            user_id: userId,
          }
        })
  
        if(user.user_id === comment.user_id) {
          return res.status(400).json({message: "Nu iti poti raporta propriul comentariu!"})
        }
        
        comment.reports_count += 1;
        await comment.save();

        await models.UserCommentReport.create({
          comment_id: commentId,
          user_id: userId
        });

        const orgId = comment.post.org_id;
        
        await utils.checkAndCreateReport(commentId, 'comment', orgId, models);
        
        res.status(200).json({ message: "Comentariu raportat cu succes" });
    } catch (error) {
        res.status(500).json({ message: "Eroare la raportarea comentariului ", error });
    }
}

async function getReportedPosts(req, res) {
    try {
      const moderatorId = req.user.user_id;
      
      const reportedPosts = await models.PostReport.findAll({
        where: {
          user_id: moderatorId,
          reviewed: false
        },
        include: [{
          model: models.Post,
          include: [{
            model: models.User,
            attributes: ['user_id', 'username', 'email']
          }]
        }]
      });
      
      const formattedReports = await utils.formatBannedUsernames(
        reportedPosts.map(report => {
          const reportIdentifier = `p_${report.post_id}_${moderatorId}`;
          
          return {
            report_identifier: reportIdentifier,
            post_id: report.post.post_id,
            title: report.post.title,
            description: report.post.description,
            reports_count: report.post.reports_count,
            user: report.post.user
          };
        }), 
        models
      );
      
      res.status(200).json({
        message: "Postări raportate recuperate cu succes",
        reports: formattedReports
      });
      
    } catch (error) {
      res.status(500).json({
        message: "Eroare la obținerea postărilor raportate: " + error.message
      });
    }
  }
  
  async function getReportedComments(req, res) {
    try {
      const moderatorId = req.user.user_id;
      
      const reportedComments = await models.CommentReport.findAll({
        where: {
          user_id: moderatorId,
          reviewed: false
        },
        include: [{
          model: models.Comment,
          include: [{
            model: models.User,
            attributes: ['user_id', 'username', 'email']
          }, {
            model: models.Post,
            attributes: ['post_id', 'title']
          }]
        }]
      });
      
      const formattedReports = await utils.formatBannedUsernames(
        reportedComments.map(report => {
          const reportIdentifier = `c_${report.comment_id}_${moderatorId}`;
          
          return {
            report_identifier: reportIdentifier,
            comment_id: report.comment.comment_id,
            post_id: report.comment.post.post_id,
            post_title: report.comment.post.title,
            content: report.comment.content,
            reports_count: report.comment.reports_count,
            user: report.comment.user
          };
        }),
        models
      );
      
      res.status(200).json({
        message: "Comentarii raportate recuperate cu succes",
        reports: formattedReports
      });
      
    } catch (error) {
      res.status(500).json({
        message: "Eroare la obținerea comentariilor raportate: " + error.message
      });
    }
  }

  async function markReportAsReviewed(req, res) {
    try {
      const { reportIdentifier } = req.body;
      const moderatorId = req.user.user_id;
      
      if (!reportIdentifier) {
        return res.status(400).json({ message: "Identificator de raport lipsă" });
      }
      
      const parts = reportIdentifier.split('_');
      if (parts.length !== 3) {
        return res.status(400).json({ message: "Format invalid pentru identificatorul de raport" });
      }
      
      const reportType = parts[0] === 'p' ? 'post' : 'comment';
      const itemId = parts[1];
      const reportModeratorId = parts[2];
      
      if (reportModeratorId !== moderatorId.toString()) {
        return res.status(403).json({ message: "Nu ești autorizat să revizuiești acest raport" });
      }
      
      const ReportModel = reportType === 'post' ? models.PostReport : models.CommentReport;
      const idField = reportType === 'post' ? 'post_id' : 'comment_id';
      
      const report = await ReportModel.findOne({
        where: {
          [idField]: itemId,
          user_id: moderatorId,
          reviewed: false
        }
      });
      
      if (!report) {
        return res.status(404).json({ message: "Raportul nu a fost găsit sau a fost deja revizuit" });
      }
      
      report.reviewed = true;
      await report.save();
      
      res.status(200).json({ 
        message: `${reportType === 'post' ? 'Postarea' : 'Comentariul'} a fost marcat(ă) ca revizuit(ă)` 
      });
    } catch (error) {
      console.error("Eroare la marcarea raportului ca revizuit:", error);
      res.status(500).json({ 
        message: "Eroare la marcarea raportului ca revizuit", 
        error: error.message 
      });
    }
  }

export default {
    reportPost,
    reportComment,
    getReportedPosts,
    getReportedComments,
    markReportAsReviewed,
}