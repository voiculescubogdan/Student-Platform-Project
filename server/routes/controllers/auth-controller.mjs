import bcrypt from "bcrypt";
import models from "../../models/index.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import utils from "../../utils/index.js";
import { Op } from "sequelize";
import crypto from "crypto";

const saltRounds = 10;

async function logoutUser(req, res, next) {

    const userId = req.user.user_id;
    await models.User.update(
      { token: null }, 
      { where: { user_id: userId } 
    });

      res.status(200).json({
        message: "Logout Succes!",
        
      })
  
}

async function registerUser(req, res, next) {
  try {
    const { username, email, password } = req.body;
    
    const existingEmail = await models.User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email-ul este deja utilizat" });
    }

    const existingUsername = await models.User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username-ul este deja utilizat" });
    }
    
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await models.User.create({
      username,
      email,
      password: hashedPassword,
      confirmed: false,
      confirmation_token: confirmationToken,
      confirmation_token_expires: tokenExpires
    });

    const confirmUrl = `${process.env.WEBSITE_URL}/confirm-email/${confirmationToken}`;
    await utils.sendConfirmationEmail(email, confirmUrl);
    
    res.status(201).json({ 
      message: "Cont creat cu succes! Te rugăm să confirmi email-ul pentru activare.",
      userId: newUser.user_id
    });

  } catch (err) {
    res.status(500).send("Eroare la inregistrare" + err.message);
  }
}

async function loginUser(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ 
        message: info && info.message ? info.message : "Credențiale invalide" 
      });
    }

    return res.status(200).json({
      message: "Logare reușită",
      user,
      token: user.token
    });
  })(req, res, next)
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const resetToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const resetUrl = `${process.env.WEBSITE_URL}/reset-password/${resetToken}`;
    
    await utils.sendResetEmail(email, resetUrl);

    res.status(200).json({ 
      message: "Un email cu instrucțiuni pentru resetarea parolei a fost trimis la adresa ta" 
    });
  } catch (err) {
    console.error("Error requesting password reset:", err);
    res.status(500).json({ message: "Error requesting password reset: " + err.message });
  }
}

async function resetPassword(req, res, next) {
  try {

    const token = req.params.token;
    const { newPassword, newPasswordCheck } = req.body;
    
    if (newPassword !== newPasswordCheck) {
      return res.status(400).json({ message: "Passwords don't match!" });
    }
    
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const hash = await bcrypt.hash(newPassword, saltRounds);
    
    await models.User.update(
      { password: hash },
      { where: { user_id: payload.id } }
    );
    
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password: " + err.message });
  }
}

async function confirmEmail(req, res) {
  try {
    const { token } = req.params;
    
    const user = await models.User.findOne({
      where: { 
        confirmation_token: token,
      }
    });
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Link invalid sau contul nu există" })
    }

    if (user.confirmed) {
      return res
        .status(200)
        .json({ message: "Email-ul a fost deja confirmat" })
    }

    if (user.confirmation_token_expires < new Date()) {
      return res
        .status(400)
        .json({
          message:
            "Link-ul a expirat! Te rugăm să soliciți un link de confirmare nou!"
        })
    }
    
    user.confirmed = true;
    user.confirmation_token_expires = null;
    await user.save();

    return res.status(200).send({message: "Email confirmat cu succes! \nAcum te poți autentifica în aplicație!"});

  } catch (error) {
    return res.status(500).send({message: "A aparut o eroare...\nTe rugam sa incerci mai tarziu."});
  }
}

async function resendConfirmationEmail(req, res) {
  try {
    const { email } = req.body;
    
    const user = await models.User.findOne({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu există" });
    }
    
    if (user.confirmed) {
      return res.status(400).json({ message: "Email-ul este deja confirmat" });
    }
    
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);
    
    await user.update({
      confirmation_token: confirmationToken,
      confirmation_token_expires: tokenExpires
    });
    
    const confirmUrl = `${process.env.WEBSITE_URL}/confirm-email/${confirmationToken}`;
    await utils.sendConfirmationEmail(email, confirmUrl);
    
    res.status(200).json({ message: "Email de confirmare retrimis cu succes" });
  } catch (error) {
    console.error("Error resending confirmation email:", error);
    res.status(500).json({ message: "Eroare la retrimiterea email-ului" });
  }
}

export default {
  logoutUser,
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  confirmEmail,
  resendConfirmationEmail,
}