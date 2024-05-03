const { executarQuery } = require("../../providers/dbPDV7");

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

      // console.log(sql)

    // const sql = `SELECT idCaixa, idPDV, dtAbertura, dtFechamento FROM tbCaixa DtFechamento WHERE idCaixa=18087`;
    const result = await executarQuery(sql, []);

    if (result.length === 0) console.log("Sem caixas fechados para integrar");

    return Object.values(result);
  } catch (error) {
    console.error(`Erro ao listar caixas: ${error}`);
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
