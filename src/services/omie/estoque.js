const { apiOmie, omieAuth } = require("../../providers/apiOmie");
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
      error.response &&
      error.response.data &&
      error.response.data.faultstring === "ERROR: Não existem registros para a página [1]!"
    )
      console.log("Sem produtos para produzir");
    else console.error("Erro ao obter registros da API:", error);

    return [];
  }
}

module.exports = { listarPosEstoqueProdutosAcabados };
