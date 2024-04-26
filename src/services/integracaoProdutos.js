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
        console.log("Incluir produto", produto.descricao);
        await importarProduto(produto);
      }

      const config = await getConfig();
      config.ultimaIntegracaoProdutos = obterDataMaisRecente(produtos);
      await saveConfig(config);
    }
  } catch (error) {
    console.error("Erro ao integrar produtos:", error);
  }
}

module.exports = { integracaoProdutos };
