const sql = require("mssql");
const { getConfig, saveConfig } = require("../providers/config");
const { listarProdutos, obterDataMaisRecente } = require("./omie/produtos");
const { importarProduto } = require("./pdv7/produtos");

async function integracaoProdutos() {
  try {
    const config = await getConfig();

    const produtos = await listarProdutos(config.ultimaIntegracaoProdutos);
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        await importarProduto(produto);
      }

      config.ultimaIntegracaoProdutos = obterDataMaisRecente(produtos);
      await saveConfig(config);
    }
  } catch (error) {
    logger.error("Erro ao integrar produtos:", error);
  }
}

module.exports = { integracaoProdutos };
