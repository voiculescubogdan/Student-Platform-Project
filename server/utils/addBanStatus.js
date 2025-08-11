export async function isBanned(user, models) {
    try {
      if (!user || !user.email) {
        return false;
      }
      
      const banned = await models.Blacklist.findOne({
        where: {
          email: user.email
        }
      });
      
      return !!banned;
    } catch (error) {
      console.error('Error checking ban status:', error);
      return false;
    }
  }

  export async function addBanStatus(usersData, models) {
    const isArray = Array.isArray(usersData);
    
    if (!usersData) return isArray ? [] : null;
    
    if (!isArray) {
      const userObj = usersData.toJSON ? usersData.toJSON() : {...usersData};
      userObj.banned = await isBanned(usersData, models);
      return userObj;
    }
    
    const emails = usersData.map(user => user?.email).filter(Boolean);
    
    const bannedUsers = await models.Blacklist.findAll({
      where: { email: emails }
    });
    
    const bannedEmails = new Set(bannedUsers.map(user => user.email));
    
    return usersData.map(user => {
      const userObj = user.toJSON ? user.toJSON() : {...user};
      userObj.banned = user.email ? bannedEmails.has(user.email) : false;
      return userObj;
    });
  }