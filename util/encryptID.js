const { v4: uuidv4, v5: uuidv5 } = require('uuid');

const encryptID = async (envs) =>
    uuidv5(envs ?? 'id' + Date.now() * Math.random(), uuidv4());

module.exports = encryptID;
