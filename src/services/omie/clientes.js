const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const logger = require("../../providers/logger");

async function consultarCliente(cliente) {
  try {
    const param = [
      {
        codigo_cliente_integracao: cliente.idCliente,
      },
    ];

    const body = {
      call: "ConsultarCliente",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("geral/clientes/", body);
    return response.data;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.faultstring.includes("não cadastrado")
    )
      return null;

    logger.error("Erro ao consultar cliente (omie)", cliente, error);
  }
}

async function incluirCliente(cliente) {
  try {
    const param = [
      {
        codigo_cliente_integracao: cliente.idCliente,
        razao_social: cliente.nomeCompleto,
      },
    ];

    const body = {
      call: "IncluirCliente",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("geral/clientes/", body);
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.faultstring.includes("Cliente já cadastrado")
    )
      logger.info(`Cliente ${cliente.idCliente} já está cadastrado.`);
    else logger.error("Erro ao incluir cliente (omie)", cliente, error);
  }
}

async function alterarCliente(cliente) {
  try {
    const param = [
      {
        codigo_cliente_integracao: cliente.idCliente,
        razao_social: cliente.nomeCompleto,
      },
    ];

    const body = {
      call: "AlterarCliente",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("geral/clientes/", body);
  } catch (error) {
    if (
      error.response ||
      error.response.data.faultstring ||
      error.response.data.faultstring.includes("não cadastrado")
    )
      logger.info(`Cliente ${cliente.idCliente} não está cadastrado.`);
    else logger.error("Erro ao alterar cliente (omie)", cliente, error);
  }
}

module.exports = { incluirCliente, alterarCliente, consultarCliente };
