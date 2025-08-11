import models from "../models/index.js";

const checkEmailConfirmed = async (req, res, next) => {
    try {
      const { email } = req.body;
      
      const user = await models.User.findOne({
        where: { email }
      });
      
      if (user && !user.confirmed) {
        return res.status(403).json({ 
          message: "Te rugăm să confirmi adresa de email înainte de autentificare",
          needsConfirmation: true
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking if email is confirmed! ", error });
    }
  };

  export default checkEmailConfirmed;