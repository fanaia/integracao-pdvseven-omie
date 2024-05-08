const { executarQuery } = require("../../providers/dbPDV7");
const logger = require("../../providers/logger");

async function listarClientes(ultimaIntegracaoClientes) {
  try {
    const sql = `SELECT idCliente, nomeCompleto, dtAlteracao FROM tbCliente WHERE DtAlteracao>'${ultimaIntegracaoClientes.toISOString()}'`;
    const result = await executarQuery(sql);

    return Object.values(result);
  } catch (error) {
    logger.error(`Erro ao listar clientes (pdv7): ${error}`);
    return [];
  }
}

async function ajustarDataAlteracao() {
  try {
    const sql = `UPDATE tbCliente SET dtAlteracao=getDate() WHERE dtAlteracao IS NULL`;
    const result = await executarQuery(sql);

    return new Date(result[0].dtAlteracao);
  } catch (error) {
    logger.error(`Erro ao ajustar data de alteração dos clientes (pdv7): ${error}`);
  }
}

async function obterDataMaisRecente(clientes) {
  let dataMaisRecente = new Date(0);

  for (const cliente of clientes) {
    const dtAlteracao = new Date(cliente.dtAlteracao);

    if (dtAlteracao > dataMaisRecente) {
      dataMaisRecente = dtAlteracao;
    }
  }

  return dataMaisRecente;
}

module.exports = { listarClientes, ajustarDataAlteracao, obterDataMaisRecente };
