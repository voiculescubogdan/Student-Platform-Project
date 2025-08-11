import axios from "../../utils/setupAxios.js"

class OrganizationStore {
    organizations = []
    organizationsCache = null;
    organizationsTimestamp = null;
    followedOrganizationsCache = null;
    followedOrganizationsTimestamp = null;
    cacheExpiryMs = 5 * 60 * 1000;

    async getAllOrganizations() {
      try {
        const now = Date.now();
        if (
          this.organizationsCache && 
          this.organizationsTimestamp && 
          (now - this.organizationsTimestamp < this.cacheExpiryMs)
        ) {
          return {
            message: "Organizații încărcate din cache",
            organizations: this.organizationsCache,
            fromCache: true
          }
        }
      
        const res = await axios.get("/api/users/get-organizations")
        
        this.organizationsCache = res.data.organizations || [];
        this.organizationsTimestamp = now;
        
        return {
          message: res.data.message,
          organizations: res.data.organizations,
          fromCache: false
        }
      } catch (err) {
        throw err.response?.data || err
      }
    }

    async getFollowedOrganizations() {
      try {
        const now = Date.now();
        if (
          this.followedOrganizationsCache && 
          this.followedOrganizationsTimestamp && 
          (now - this.followedOrganizationsTimestamp < this.cacheExpiryMs)
        ) {
          return {
            message: "Organizații urmărite încărcate din cache",
            organizations: this.followedOrganizationsCache,
            fromCache: true
          }
        }
        
        const res = await axios.get("/api/users/get-organizations/followed")
        
        this.followedOrganizationsCache = res.data.organizations || [];
        this.followedOrganizationsTimestamp = now;
        
        return {
          message: res.data.message,
          organizations: res.data.organizations,
          fromCache: false
        }
      } catch (err) {
        throw err.response?.data || err
      }
    }

    async toggleFollowOrganization(organizationId) {
      try {
        const res = await axios.post(`/api/users/get-organization/${organizationId}/toggle-follow`);
        return {
          message: res.data.message,
          isFollowing: res.data.isFollowing,
        };
      } catch (err) {
        throw err.response?.data || err;
      }
    }

    invalidateCache() {
      this.organizationsCache = null;
      this.organizationsTimestamp = null;
      this.followedOrganizationsCache = null;
      this.followedOrganizationsTimestamp = null;
    }
}

export default new OrganizationStore()