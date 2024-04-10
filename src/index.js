// index.js
const { conectar, desconectar } = require("./providers/dbPDV7");
const { listarProdutos, importarProdutos } = require("./services/integrarProdutosOmie");

async function main() {
  try {
    await conectar();

    const listaProdutos = await listarProdutos();
    await importarProdutos(listaProdutos);
  } catch (error) {
    console.error("Erro principal:", error);
  } finally {
    await desconectar();
  }
}

main();
