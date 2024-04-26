const fs = require("fs").promises;
const path = require("path");

const configPath = path.resolve("config.json");

async function getConfig() {
  const configJson = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(configJson);

  if (!config.ultimaIntegracaoProdutos)
    config.ultimaIntegracaoProdutos = new Date("2000-01-01T00:00:00");
  else config.ultimaIntegracaoProdutos = new Date(config.ultimaIntegracaoProdutos);

  if (!config.ultimaIntegracaoPedidos)
    config.ultimaIntegracaoPedidos = new Date("2000-01-01T00:00:00");
  else config.ultimaIntegracaoPedidos = new Date(config.ultimaIntegracaoPedidos);

  if (!config.ultimaIntegracaoClientes)
    config.ultimaIntegracaoClientes = new Date("2000-01-01T00:00:00");
  else config.ultimaIntegracaoClientes = new Date(config.ultimaIntegracaoClientes);

  return config;
}

async function getFormaPagByIdTipoPagamento(idTipoPagamento) {
  const config = await getConfig();
  const formaPag = config.formasPag.find((forma) =>
    forma.idTipoPagamento.includes(idTipoPagamento)
  );

  if (!formaPag) {
    throw new Error(`Forma de pagamento com idTipoPagamento ${idTipoPagamento} não encontrada`);
  }

  return formaPag;
}

async function saveConfig(config) {
  const configJson = JSON.stringify(config, null, 2);
  await fs.writeFile(configPath, configJson, "utf8");
}

module.exports = { getConfig, saveConfig, getFormaPagByIdTipoPagamento };
