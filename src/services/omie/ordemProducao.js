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
    logger.error("Erro ao incluir ordem de produção (omie)", produto, error);
  }
}

async function concluirOrdemProducao(op, quantidadeProduzida) {
  try {
    const param = [
      {
        cCodIntOP: op.cCodIntOP,
        dDtConclusao: formatarData(new Date()),
        nQtdeProduzida: quantidadeProduzida,
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    logger.error("Erro ao concluir ordem de produção (omie)", op, error);
  }
}

module.exports = { incluirOrdemProducao, concluirOrdemProducao };
