const { executarProc } = require("../providers/dbPDV7");
const { apiOmie, omieAuth } = require("../providers/apiOmie");

async function listarProdutos() {
  try {
    const param = [{}];

    const body = {
      call: "ConsultarOS",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("servicos/os/", body);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter registros da API:", error);
    return [];
  }
}

async function importarProdutos(registros) {
  try {
    const pool = await sql.connect(config);
    for (const registro of registros) {
      const { campo1, campo2, campo3, campo4 } = registro;

      const parametros = [
        { nome: "parametro1", tipo: sql.VarChar, valor: "valor1" },
        // Adicione mais parâmetros conforme necessário
      ];
      await executarProc("NomeDaSuaProcedure", parametros);

      console.log("Registro processado:", registro);
    }
  } catch (error) {
    console.error("Erro ao processar registros:", error);
  }
}

module.exports = { listarProdutos, importarProdutos };
