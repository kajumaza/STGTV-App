const fs = require('fs');
const path = require('path');

class StagwellDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'credentials.json');
    this.ensureDbExists();
  }

  ensureDbExists() {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({}), 'utf8');
    }
  }

  readCredentials() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading credentials:', error);
      return {};
    }
  }

  writeCredentials(credentials) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(credentials, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing credentials:', error);
    }
  }

  saveUserCredentials(username, stagwellTelephone, stagwellPassword) {
    const credentials = this.readCredentials();
    credentials[username] = {
      stagwellTelephone,
      stagwellPassword
    };
    this.writeCredentials(credentials);
  }

  getUserCredentials(username) {
    const credentials = this.readCredentials();
    return credentials[username] || null;
  }
}

module.exports = new StagwellDatabase();