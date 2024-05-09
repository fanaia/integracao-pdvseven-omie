const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const logger = require("../../providers/logger");
const { formatarData } = require("../../utils/dateUtils");

async function listarPosEstoqueProdutosAcabados(dataPosicao) {
  try {
    const param = [
      {
        nPagina: 1,
        nRegPorPagina: 500,
        dDataPosicao: formatarData(dataPosicao),
        cExibeTodos: "N",
        cTipoItem: "04",
      },
    ];

    const body = {
      call: "ListarPosEstoque",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("estoque/consulta/", body);
    return response.data.produtos;
  } catch (error) {
    if (
      !error.response &&
      !error.response.data &&
      !error.response.data.faultstring.includes("Não existem registros")
    )
      return [];

    if (error.response?.data?.faultstring?.includes("bloqueada por consumo indevido"))
      throw error.response?.data?.faultstring;

    logger.error(
      `Erro ao listar posição de estoque de produtos acabados (omie): ${JSON.stringify(error.response?.data)}`
    );
  }
}

module.exports = { listarPosEstoqueProdutosAcabados };
