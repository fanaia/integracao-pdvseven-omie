const { executarQuery } = require("../../providers/dbPDV7");
const logger = require("../../providers/logger");

async function listarClientes(ultimaIntegracaoClientes) {
  try {
    const sql = `SELECT idCliente, nomeCompleto, dtAlteracao FROM tbCliente WHERE DtAlteracao>'${ultimaIntegracaoClientes.toISOString()}' ORDER BY DtAlteracao`;
    const result = await executarQuery(sql);

    return Object.values(result);
  } catch (error) {
    logger.error(`Erro ao listar clientes (pdv7): ${error}`);
    return [];
  }
}

async function ajustarDataAlteracao() {
  try {
    const sql = `UPDATE tbCliente 
      SET DtAlteracao = (SELECT TOP 1 DtPedido FROM tbPedido p WHERE p.IDCliente=tbCliente.IDCliente)
      WHERE dtAlteracao IS NULL`;
    const result = await executarQuery(sql);
  } catch (error) {
    logger.error(`Erro ao ajustar data de alteração dos clientes (pdv7): ${error}`);
  }
}

module.exports = { listarClientes, ajustarDataAlteracao };
