const { default: axios } = require("axios");

const apiOmie = axios.create({
  baseURL: process.env.OMIE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const omieAuth = {
  appKey: process.env.OMIE_APP_KEY,
  appSecret: process.env.OMIE_APP_SECRET,
};

module.exports = { apiOmie, omieAuth };
