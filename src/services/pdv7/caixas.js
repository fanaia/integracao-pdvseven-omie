const { executarQuery } = require("../../providers/dbPDV7");
const logger = require("../../providers/logger");

async function listarCaixasFechados(ultimaIntegracaoCaixas) {
  try {
    const sql = `
      SELECT 
        c.idCaixa, c.idPDV, c.dtAbertura, c.dtFechamento,
        ISNULL(SUM(valorAbertura), 0) as valorAbertura,
        ISNULL(SUM(valorFechamento), 0) as valorFechamento
      FROM 
        tbCaixa c
        LEFT JOIN tbCaixaValorRegistro cvr ON cvr.idCaixa=c.idCaixa
      WHERE
        dtFechamento>'${ultimaIntegracaoCaixas.toISOString()}'
      GROUP BY
        c.idCaixa, c.idPDV, c.dtAbertura, c.dtFechamento 
      ORDER BY c.dtFechamento DESC `;

    const result = await executarQuery(sql);

    return Object.values(result);
  } catch (error) {
    logger.error(`Erro ao listar caixas fechados (pdv7): ${error}`);
    return [];
  }
}

async function obterDataMaisRecente(caixas) {
  let dataMaisRecente = new Date(0);

  for (const caixa of caixas) {
    const dtFechamento = new Date(caixa.dtFechamento);

    if (dtFechamento > dataMaisRecente) {
      dataMaisRecente = dtFechamento;
    }
  }

  return dataMaisRecente;
}

module.exports = { listarCaixasFechados, obterDataMaisRecente };
