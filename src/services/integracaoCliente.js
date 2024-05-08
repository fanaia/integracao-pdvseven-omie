const { getConfig, saveConfig } = require("../providers/config");
const { listarClientes, ajustarDataAlteracao } = require("./pdv7/clientes");
const { incluirCliente, alterarCliente, consultarCliente } = require("./omie/clientes");
const logger = require("../providers/logger");

async function integracaoClientes() {
  let counterTotal = 0;
  let dtUltimaIntegracao;

  try {
    const config = await getConfig();
    dtUltimaIntegracao = config.ultimaIntegracaoClientes;

    await ajustarDataAlteracao();

    const clientes = await listarClientes(config.ultimaIntegracaoClientes);

    if (clientes && clientes.length > 0) {
      for (const cliente of clientes) {
        const clienteCadastrado = await consultarCliente(cliente);
        if (clienteCadastrado) await alterarCliente(cliente);
        else await incluirCliente(cliente);

        dtUltimaIntegracao = cliente.dtAlteracao;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        counterTotal++;
      }
    }

    config.ultimaIntegracaoClientes = dtUltimaIntegracao;
    await saveConfig(config);
  } catch (error) {
    logger.error("Erro ao integrar clientes: " + error);
    logger.info("Total de clientes integrados: " + counterTotal + " de " + clientes.length);

    const config = await getConfig();
    config.ultimaIntegracaoClientes = dtUltimaIntegracao;
    await saveConfig(config);
  }
}

module.exports = { integracaoClientes };
