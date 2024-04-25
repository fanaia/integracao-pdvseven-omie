const { formatarData, formatarHora } = require("../../utils/dateUtils");
const { apiOmie, omieAuth } = require("../../providers/apiOmie");

async function listarProdutos(ultimaIntegracaoProdutos) {
  try {
    ultimaIntegracaoProdutos.setSeconds(ultimaIntegracaoProdutos.getSeconds() + 1);

    const param = [
      {
        pagina: 1,
        registros_por_pagina: 50,
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
      error.response.data.faultstring === "ERROR: Não existem registros para a página [1]!"
    )
      console.log("Sem produtos para importar");
    else console.error("Erro ao obter registros da API:", error);

    return [];
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
