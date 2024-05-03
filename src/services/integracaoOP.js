const { listarPosEstoqueProdutosAcabados } = require("./omie/estoque");
const { incluirOrdemProducao, concluirOrdemProducao } = require("./omie/ordemProducao");

async function integracaoOP() {
  console.log("Integração Ordem de Produção");

  const produtos = await listarPosEstoqueProdutosAcabados(new Date());
  if (produtos && produtos.length > 0) {
    const produtosComSaldoNegativo = produtos.filter((produto) => produto.nSaldo < 0);

    for (const produto of produtosComSaldoNegativo) {
      console.log("Produto:", produto.cDescricao, "Saldo:", produto.nSaldo);
      const op = await incluirOrdemProducao(produto);
      await concluirOrdemProducao(op, produto.nSaldo * -1);
    }
  }
}

module.exports = { integracaoOP };
