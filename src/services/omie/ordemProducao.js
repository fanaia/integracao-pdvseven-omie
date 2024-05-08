const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const logger = require("../../providers/logger");
const { formatarData } = require("../../utils/dateUtils");

async function incluirOrdemProducao(produto) {
  try {
    const date = new Date();

    const param = [
      {
        identificacao: {
          cCodIntOP: "OP" + produto.cCodigo + "-" + date.getTime(),
          dDtPrevisao: formatarData(date),
          nCodProduto: produto.nCodProd,
          nQtde: produto.nSaldo * -1,
        },
      },
    ];

    const body = {
      call: "IncluirOrdemProducao",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("produtos/op/", body);
    return response.data;
  } catch (error) {
    if (error.response?.data?.faultstring?.includes("bloqueada por consumo indevido"))
      throw error.response?.data;

    logger.error(
      "Erro ao incluir ordem de produção do produto " +
        produto.cDescricao +
        " (omie): " +
        JSON.stringify(error.response?.data)
    );
  }
}

async function concluirOrdemProducao(produto, cCodIntOP) {
  try {
    const param = [
      {
        cCodIntOP: cCodIntOP,
        dDtConclusao: formatarData(new Date()),
        nQtdeProduzida: produto.nSaldo * -1,
        cObsConclusao: "",
      },
    ];

    const body = {
      call: "ConcluirOrdemProducao",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("produtos/op/", body);
    return response.data;
  } catch (error) {
    if (error.response?.data?.faultstring?.includes("bloqueada por consumo indevido"))
      throw error.response?.data?.faultstring;

    logger.error(
      "Erro ao concluir ordem de produção do produto " +
        produto.cDescricao +
        " (omie): " +
        JSON.stringify(error.response?.data)
    );
  }
}

module.exports = { incluirOrdemProducao, concluirOrdemProducao };
