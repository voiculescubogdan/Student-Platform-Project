import models from "../../models/index.js";

async function banUser(req, res, next) {
    try {

        const userId = req.params.uid;
        const newUsername = "BANNED_USER";

        const user = await models.User.findOne({
            where: {
                user_id: userId,
            }
        })

        await models.Blacklist.create({
            email: user.email,
        })

        res.status(200).json({message: "User banned successfully!"})

    } catch (err) {
        res.status(500).json({message: "Error banning user! ", err})
    }
}

async function unBanUser(req, res, next) {
    try {

        const userId = req.params.uid;

        const user = await models.User.findOne({
            where: {
                user_id: userId,
            }
        })

        await models.Blacklist.destroy({
            where: {
                email: user.email,
            }
        })

        res.status(200).json({message: "User unbanned successfully!"})

    } catch (err) {
        res.status(500).json({message: "Error unbanning user! ", err})
    }
}

export default {
    banUser,
    unBanUser,
}