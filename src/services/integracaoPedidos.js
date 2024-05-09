const { getConfig, saveConfig } = require("../providers/config");
const logger = require("../providers/logger");
const { incluirCupomFiscal, fecharCaixa } = require("./omie/cupomFiscal");
const { obterDataMaisRecente, listarCaixasFechados } = require("./pdv7/caixas");
const { listarPedidos } = require("./pdv7/pedidos");

async function integracaoPedidos() {
  try {
    const config = await getConfig();

    const caixas = await listarCaixasFechados(config.ultimaIntegracaoCaixas);
    if (caixas && caixas.length > 0) {
      for (const caixa of caixas) {
        const pedidos = await listarPedidos(caixa.idCaixa);

        if (pedidos && pedidos.length > 0) {
          logger.info(`Integrando ${pedidos.length} pedidos do caixa ${caixa.idCaixa}...`);

          for (const pedido of pedidos) {
            await incluirCupomFiscal(pedido);
          }
          
          await fecharCaixa(caixa);
        }
      }

      config.ultimaIntegracaoCaixas = await obterDataMaisRecente(caixas);
      await saveConfig(config);
    }
  } catch (error) {
    logger.error("Erro ao integrar pedidos: " + error);
  }
}

module.exports = { integracaoPedidos };
