require("dotenv").config();
const { integracaoProdutos } = require("./services/integracaoProdutos");
const { integracaoClientes } = require("./services/integracaoCliente");
const { integracaoPedidos } = require("./services/integracaoPedidos");
const { integracaoOP } = require("./services/integracaoOP");
const logger = require("./providers/logger");

const INTERVALO = 3 * 60 * 1000;

async function integrar() {
  try {
    console.log("Integrando clientes...");
    await integracaoClientes();

    console.log("Integrando produtos...");
    await integracaoProdutos();

    console.log("Integrando pedidos...");
    await integracaoPedidos();

    console.log("Integrando ordens de produção...");
    await integracaoOP();
  } catch (error) {
    logger.error("Erro principal:", error);
  } finally {
    setTimeout(integrar, INTERVALO);
  }
}

function main() {
  logger.info("Iniciando serviço de Integração PDVSeven x Omie");
  integrar();
}

main();
