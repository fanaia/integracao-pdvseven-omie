const crypto = require('crypto');

function getMD5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function base64ToString(input) {
  return Buffer.from(input, 'base64').toString('utf8');
}

module.exports = { getMD5, base64ToString };