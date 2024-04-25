const { getConfig, saveConfig } = require("../providers/config");
const { listarClientes, obterDataMaisRecente } = require("./pdv7/clientes");
const { incluirCliente, alterarCliente, consultarCliente } = require("./omie/clientes");

async function integracaoClientes() {
  try {
    const config = await getConfig();
    const clientes = await listarClientes(config.ultimaIntegracaoClientes);

    if (clientes && clientes.length > 0) {
      for (const cliente of clientes) {
        console.log("Incluir cliente", cliente.nomeCompleto);

        const clienteCadastrado = await consultarCliente(cliente);
        if (clienteCadastrado) await alterarCliente(cliente);
        else await incluirCliente(cliente);
      }

      config.ultimaIntegracaoClientes = await obterDataMaisRecente(clientes);
      await saveConfig(config);
    }
  } catch (error) {
    console.error("Erro ao integrar clientes:", error);
  }
}

module.exports = { integracaoClientes };