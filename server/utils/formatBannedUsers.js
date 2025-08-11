export async function formatBannedUsernames(items, models) {
    try {
      const isSingleItem = !Array.isArray(items);
      
      const itemsArray = isSingleItem ? [items] : items;
      
      const emails = itemsArray
        .map(item => item.user?.email)
        .filter(email => email);
      
      if (emails.length === 0) return isSingleItem ? itemsArray[0] : itemsArray;
      
      const bannedUsers = await models.Blacklist.findAll({
        where: { email: emails }
      });
      
      const bannedEmails = new Set(bannedUsers.map(user => user.email));
      
      const processedItems = itemsArray.map(item => {
        const result = item.toJSON ? item.toJSON() : item;
        
        if (result.user?.email && bannedEmails.has(result.user.email)) {
          result.user.username = "BANNED_USER";
        }
        
        if (result.user) {
          result.username = result.user.username;
        }
        
        return result;
      });
      
      return isSingleItem ? processedItems[0] : processedItems;
    } catch (error) {
      console.error("Eroare la procesarea utilizatorilor banați:", error);
      return items;
    }
}