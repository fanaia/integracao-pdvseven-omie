const { getConfig, saveConfig } = require("../providers/config");
const { incluirCupomFiscal, fecharCaixa } = require("./omie/cupomFiscal");
const { obterDataMaisRecente, listarCaixasFechados } = require("./pdv7/caixas");
const { listarPedidos } = require("./pdv7/pedidos");

async function integracaoPedidos() {
  console.log("Integração Pedidos");

  const config = await getConfig();

  const caixas = await listarCaixasFechados(config.ultimaIntegracaoCaixas);
  console.log(caixas.length, "caixas fechadas para integrar");
  if (caixas && caixas.length > 0) {
    for (const caixa of caixas) {
      const pedidos = await listarPedidos(caixa.idCaixa);
      console.log(`Caixa ${caixa.idCaixa} possui ${pedidos.length} pedidos`);

      if (pedidos && pedidos.length > 0) {
        for (const pedido of pedidos) {
          console.log("Pedido:", pedido.idPedido, "Caixa:", caixa.idCaixa);
          await incluirCupomFiscal(pedido);
        }
      }
      await fecharCaixa(caixa);
    }

      config.ultimaIntegracaoCaixas = await obterDataMaisRecente(caixas);
      await saveConfig(config);
  }
}

module.exports = { integracaoPedidos };
