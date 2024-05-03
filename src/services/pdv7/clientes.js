const { executarQuery } = require("../../providers/dbPDV7");

async function listarClientes(ultimaIntegracaoClientes) {
  try {
    const sql = `SELECT idCliente, nomeCompleto, dtAlteracao FROM tbCliente WHERE DtAlteracao>'${ultimaIntegracaoClientes.toISOString()}'`;
    const result = await executarQuery(sql, []);

    if (result.length === 0) console.log("Sem clientes para exportar");

    return Object.values(result);
  } catch (error) {
    console.error(`Erro ao listar clientes: ${error}`);
  }
}

async function ajustarDataAlteracao() {
  try {
    const sql = `UPDATE tbCliente SET dtAlteracao=getDate() WHERE dtAlteracao IS NULL`;
    const result = await executarQuery(sql, []);

    return new Date(result[0].dtAlteracao);
  } catch (error) {
    console.error(`Erro ao atualizar data de alteração: ${error}`);
  }
}

async function obterDataMaisRecente(clientes) {
  let dataMaisRecente = new Date(0); // Inicializa com a data mais antiga possível

  for (const cliente of clientes) {
    const dtAlteracao = new Date(cliente.dtAlteracao);

    if (dtAlteracao > dataMaisRecente) {
      dataMaisRecente = dtAlteracao;
    }
  }

  return dataMaisRecente;
}

module.exports = { listarClientes, ajustarDataAlteracao, obterDataMaisRecente };
