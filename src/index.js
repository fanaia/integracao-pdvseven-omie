require("dotenv").config();
const { integracaoProdutos } = require("./services/integracaoProdutos");
const { integracaoClientes } = require("./services/integracaoCliente");
const { integracaoPedidos } = require("./services/integracaoPedidos");
const { integracaoOP } = require("./services/integracaoOP");

const INTERVALO = 1 * 60 * 1000;

async function integrar() {
  try {
    console.log("Iniciando integração");

    // await integracaoClientes();
    await integracaoProdutos();
    await integracaoPedidos();
    // await integracaoOP();

    console.log("Integração finalizada");
  } catch (error) {
    console.error("Erro principal:", error);
  } finally {
    setTimeout(integrar, INTERVALO);
  }
}

function main() {
  console.log("Iniciando serviço de Integração PDVSeven x Omie");
  integrar();
}

main();
