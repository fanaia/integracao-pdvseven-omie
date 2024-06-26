const { executarQuery } = require("../../providers/dbPDV7");
const logger = require("../../providers/logger");

async function importarProduto(produto) {
  try {
    const { descricao, inativo, valor_unitario, codigo_produto } = produto;

    let ativo = 1;
    let excluido = 0;
    if (inativo === "S") {
      excluido = 1;
      ativo = 0;
    }

    const sql = `SELECT idproduto FROM tbProduto WHERE Codigo = '${codigo_produto}' OR TRIM(Nome) = TRIM('${descricao}')`;
    let product = await executarQuery(sql);

    if (product.length > 0) {
      const idproduto = product[0].idproduto;
      const sql = `UPDATE tbProduto SET ValorUnitario = ${valor_unitario}, Ativo = ${ativo}, Nome = '${descricao}', Codigo = '${codigo_produto}', Excluido = ${excluido} WHERE IDProduto = ${idproduto}`;
      await executarQuery(sql);
    } else {
      let IDTipoProduto = 10;
      let Disponibilidade = 1;
      let ControlarEstoque = 0;
      let UtilizarBalanca = 0;

      const sql = `INSERT INTO tbproduto (Nome, Ativo, ValorUnitario, Codigo, IDTipoProduto, Disponibilidade, DtAlteracaoDisponibilidade, DtUltimaAlteracao, ControlarEstoque, UtilizarBalanca, Excluido) 
        VALUES ('${descricao}', ${ativo}, ${valor_unitario}, '${codigo_produto}', ${IDTipoProduto}, ${Disponibilidade}, GetDate(), GetDate(), ${ControlarEstoque}, ${UtilizarBalanca}, ${excluido})`;

      await executarQuery(sql);
    }
  } catch (error) {
    logger.error(`Erro ao importar produto (pdv7): ${error} \n ${produto}`);
  }
}

module.exports = { importarProduto };
