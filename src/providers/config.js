const fs = require('fs').promises;
const path = require('path');

const configPath = path.resolve('config.json');

async function getConfig() {
    const configJson = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configJson);
}

async function saveConfig(config) {
    const configJson = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, configJson, 'utf8');
}

module.exports = { getConfig, saveConfig };