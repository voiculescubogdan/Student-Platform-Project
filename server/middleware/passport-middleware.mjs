import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import models from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new Strategy({ usernameField: "email" }, async function verify(username, password, cb) {
    try {
      const users = await models.User.findAll({
        where: {
          email: username,
        },
        include: [
          {
            model: models.Organization,
            as: 'organization',
            attributes: ['org_id', 'name', 'description', 'members_count'],
            required: false
          }
        ]
      })

      if(users.length > 0) {
        const user = users[0];

        if (!user.confirmed) {
          return cb(null, false, { 
            message: "Email-ul nu a fost confirmat. Te rugăm să confirmi email-ul.",
            needsConfirmation: true
          });
        }

        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, async (err, valid) => {
          if(err) {
            return cb(err);
          } else {
            if(valid) {

              const banned = await models.Blacklist.findOne({
                where: {
                  email: user.email,
                }
              })

              if(banned) {
                return cb(null, false, {message: "User is banned!"});
              }

              const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET)
              user.token = token
              await user.save()
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        })
      } else {
        return cb("User not found!");
      }
    } catch(err) {
      return cb(err);
    }
  })
)

passport.use(
  new JwtStrategy(opts, async (jwt_payload, cb) => {
    try {
      const user = await models.User.findOne({ 
        where: { user_id: jwt_payload.id },
        include: [
          {
            model: models.Organization,
            as: 'organization',
            attributes: ['org_id', 'name', 'description', 'members_count'],
            required: false
          }
        ]
      });

      if (user) {
        return cb(null, user);
      } else {
        return cb(null, false);
      }
    } catch (err) {
      return cb(err, false);
    }
  })
);

export default passport;