const { formatarData, formatarHora } = require("../../utils/dateUtils");
const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const logger = require("../../providers/logger");

async function listarProdutos(ultimaIntegracaoProdutos) {
  try {
    ultimaIntegracaoProdutos.setSeconds(ultimaIntegracaoProdutos.getSeconds() + 1);

    const param = [
      {
        pagina: 1,
        registros_por_pagina: 500,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N",
        filtrar_por_data_de: formatarData(ultimaIntegracaoProdutos),
        filtrar_por_hora_de: formatarHora(ultimaIntegracaoProdutos),
        filtrar_apenas_alteracao: "S",
      },
    ];

    const body = {
      call: "ListarProdutos",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("geral/produtos/", body);
    return response.data.produto_servico_cadastro;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.faultstring.includes("Não existem registros")
    )
      return [];

    if (error.response?.data?.faultstring?.includes("bloqueada por consumo indevido"))
      throw error.response?.data?.faultstring;

    logger.error(`Erro ao listar produtos (omie): ${JSON.stringify(error.response?.data)}`);
  }
}

function obterDataMaisRecente(produtos) {
  let dataMaisRecente = null;

  produtos.forEach((produto) => {
    const { dAlt, hAlt } = produto.info;

    const [dia, mes, ano] = dAlt.split("/");
    const [hora, minuto, segundo] = hAlt.split(":");

    const data = new Date(ano, mes - 1, dia, hora, minuto, segundo);

    if (!dataMaisRecente || data > dataMaisRecente) {
      dataMaisRecente = data;
    }
  });

  return dataMaisRecente;
}

module.exports = { listarProdutos, obterDataMaisRecente };
