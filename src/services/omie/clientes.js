const { apiOmie, omieAuth } = require("../../providers/apiOmie");

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
      error.response.data.faultstring === "ERROR: Cliente não cadastrado para o Código [0] !"
    )
      return null;
    else throw error;
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
    ) {
      console.log(`Cliente ${cliente.idCliente} já está cadastrado.`);
    } else {
      throw error;
    }
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
      error.response &&
      error.response.data &&
      error.response.data.faultstring.includes("Cliente não cadastrado")
    ) {
      console.log(`Cliente ${cliente.idCliente} não cadastrado.`);
    } else {
      throw error;
    }
  }
}

module.exports = { incluirCliente, alterarCliente, consultarCliente };
