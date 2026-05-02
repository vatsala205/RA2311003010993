const fs = require('fs/promises');

const CONFIG_PATH = __filename;

const config = {
  BASE_URL: 'http://20.207.122.201/evaluation-service',
  registration: {
    name: 'vatsala singh',
    email: 'vs2077@srmist.edu.in',
    rollNo: 'RA2311003010993',
    mobileNo: '9650907487',
    githubUsername: 'vatsala205',
    accessCode: ''
  },
  clientID: '',
  clientSecret: ''
};

async function saveClientCredentials(clientID, clientSecret) {
  config.clientID = clientID;
  config.clientSecret = clientSecret;

  const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
  const updatedContents = fileContents
    .replace(/clientID: '.*'/, `clientID: '${clientID}'`)
    .replace(/clientSecret: '.*'/, `clientSecret: '${clientSecret}'`);

  await fs.writeFile(CONFIG_PATH, updatedContents, 'utf8');
}

module.exports = {
  config,
  saveClientCredentials
};
