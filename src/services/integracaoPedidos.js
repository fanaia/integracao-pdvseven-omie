const { getConfig, saveConfig } = require("../providers/config");
const { incluirCupomFiscal, fecharCaixa } = require("./omie/cupomFiscal");
const { obterDataMaisRecente, listarCaixasFechados } = require("./pdv7/caixas");
const { listarPedidos } = require("./pdv7/pedidos");

async function integracaoPedidos() {
  const config = await getConfig();

  const caixas = await listarCaixasFechados(config.ultimaIntegracaoCaixas);

  if (caixas && caixas.length > 0) {
    for (const caixa of caixas) {
      const pedidos = await listarPedidos(caixa.idCaixa);
    
      if (pedidos && pedidos.length > 0) {
        for (const pedido of pedidos) {
          console.log(`IncluirCupom caixa ${caixa.idCaixa} e pedido ${pedido.idPedido}`);
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
