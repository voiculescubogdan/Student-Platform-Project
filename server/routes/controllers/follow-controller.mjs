import models from "../../models/index.js";

async function toggleFollowOrganization(req, res, next) {
    try {
        const userId = req.user.user_id;
        const orgId = req.params.oid;
        
        const organization = await models.Organization.findByPk(orgId);
        if (!organization) {
            return res.status(404).json({message: "Organization not found!"});
        }
        
        const existingFollow = await models.Follow.findOne({
            where: {
                user_id: userId,
                org_id: orgId
            }
        });
        
        let action;
        let message;
        
        if (existingFollow) {
            await models.Follow.destroy({
                where: {
                    user_id: userId,
                    org_id: orgId
                }
            });
            action = 'unfollowed';
            message = "Organization unfollowed successfully!";
        } else {
            await models.Follow.create({
                user_id: userId,
                org_id: orgId
            });
            action = 'followed';
            message = "Organization followed successfully!";
        }
        
        res.status(200).json({
            message: message,
            action: action,
            isFollowing: action === 'followed'
        });
        
    } catch (err) {
        console.error("Error toggling organization follow:", err);
        res.status(500).json({message: "Error toggling organization follow status", error: err.message});
    }
}

async function getFollowStatus(req, res, next) {
    try {
        const userId = req.user.user_id;
        const orgId = req.params.oid;
        
        const existingFollow = await models.Follow.findOne({
            where: {
                user_id: userId,
                org_id: orgId
            }
        });
        
        res.status(200).json({
            isFollowing: !!existingFollow
        });
        
    } catch (err) {
        res.status(500).json({message: "Error checking follow status", error: err.message});
    }
}

async function getFollows(req, res, next) {
    try {

        const user = await models.User.findByPk(req.user.user_id);

        const follows = await models.Follow.findAll({
            where: {
                user_id: user.user_id,
            },
            include: [{
                model: models.Organization,
                attributes: ['org_id', 'name', 'description']
            }]
        })

        if(!follows) {
            return res.status(200).json({message: "No organizations followed!"})
        }

        return res.status(200).json({message: "Followed Organizations showed successfully!", follows})

    } catch (err) {
        res.status(500).json({message: "Error getting follows! ", err})
    }
}

export default {
    toggleFollowOrganization,
    getFollowStatus,
    getFollows,
}