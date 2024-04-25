const { getConfig, saveConfig } = require("../providers/config");
const { incluirCupomFiscal } = require("./omie/cupomFiscal");
const { listarPedidos } = require("./pdv7/pedidos");

async function integracaoPedidos() {
  const config = await getConfig();

  const pedidos = await listarPedidos(config.ultimaIntegracaoPedidos);
  // console.log(pedidos);

  if (pedidos && pedidos.length > 0) {
    for (const pedido of pedidos) {
      await incluirCupomFiscal(pedido);
    }

    // config.ultimaIntegracaoPedidos = new Date();
    // await saveConfig(config);
  }
}

module.exports = { integracaoPedidos };
