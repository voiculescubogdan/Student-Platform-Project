function checkRole(allowedRoles = []) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Nu sunteți autentificat." });
    }

    const userType = req.user.user_type; 

    if (!allowedRoles.includes(userType)) {
      return res.status(403).json({ message: "Acces interzis pentru rolul dvs." });
    }

    next();
  };
}

export default checkRole;
