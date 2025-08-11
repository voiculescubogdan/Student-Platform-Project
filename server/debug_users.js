import models from './models/index.js';

async function checkUsers() {
  try {
    console.log('Checking users and their organizations...');
    
    const users = await models.User.findAll({
      include: [{
        model: models.Organization,
        as: 'organization',
        required: false
      }],
      limit: 10
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.user_id}, Username: ${user.username}, Org_ID: ${user.org_id}, Organization: ${user.organization ? user.organization.name : 'None'}`);
    });

    // Check organizations
    const orgs = await models.Organization.findAll();
    console.log(`\nFound ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`- ID: ${org.org_id}, Name: ${org.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
