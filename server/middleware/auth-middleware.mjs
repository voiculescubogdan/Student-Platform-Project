import passport from "./passport-middleware.mjs"

const auth = passport.authenticate("jwt", {session: false});

export default auth;