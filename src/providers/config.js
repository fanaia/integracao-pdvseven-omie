const fs = require("fs").promises;
const path = require("path");
const logger = require("./logger");

const configPath = path.resolve("config.json");

async function getConfig() {
  try {
    const configJson = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configJson);

    if (!config.ultimaIntegracaoProdutos)
      config.ultimaIntegracaoProdutos = new Date("2000-01-01T00:00:00");
    else config.ultimaIntegracaoProdutos = new Date(config.ultimaIntegracaoProdutos);

    if (!config.ultimaIntegracaoCaixas)
      config.ultimaIntegracaoCaixas = new Date("2000-01-01T00:00:00");
    else config.ultimaIntegracaoCaixas = new Date(config.ultimaIntegracaoCaixas);

    if (!config.ultimaIntegracaoClientes)
      config.ultimaIntegracaoClientes = new Date("2000-01-01T00:00:00");
    else config.ultimaIntegracaoClientes = new Date(config.ultimaIntegracaoClientes);

    return config;
  } catch (error) {
    logger.error("Erro ao ler configuração:", error);
    throw error;
  }
}

async function getFormaPagByIdTipoPagamento(idTipoPagamento) {
  try {
    const config = await getConfig();
    const formaPag = config.formasPag.find((forma) =>
      forma.idTipoPagamento.includes(idTipoPagamento)
    );

    if (!formaPag) {
      throw new Error(`Forma de pagamento com idTipoPagamento ${idTipoPagamento} não encontrada`);
    }

    return formaPag;
  } catch (error) {
    logger.error("Erro ao buscar forma de pagamento:", error);
    throw error;
  }
}

async function saveConfig(config) {
  try {
    const configJson = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, configJson, "utf8");
  } catch (error) {
    logger.error("Erro ao salvar configuração:", error);
    throw error;
  }
}

module.exports = { getConfig, saveConfig, getFormaPagByIdTipoPagamento };
