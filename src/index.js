require("dotenv").config();
const { integracaoProdutos } = require("./services/integrarProdutosOmie");

async function main() {
  try {
    await integracaoProdutos();
  } catch (error) {
    console.error("Erro principal:", error);
  }
}

// Executar a função main imediatamente e a cada 5 minutos
main();
setInterval(main, 1 * 60 * 1000);