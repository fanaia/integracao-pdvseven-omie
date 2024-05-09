const logger = require("../providers/logger");
const { listarPosEstoqueProdutosAcabados } = require("./omie/estoque");
const { incluirOrdemProducao, concluirOrdemProducao } = require("./omie/ordemProducao");

async function integracaoOP() {
  try {
    const produtos = await listarPosEstoqueProdutosAcabados(new Date());
    if (produtos && produtos.length > 0) {
      logger.info(`Integrando ${produtos.length} ordens de produção...`);

      const produtosComSaldoNegativo = produtos.filter((produto) => produto.nSaldo < 0);

      for (const produto of produtosComSaldoNegativo) {
        const op = await incluirOrdemProducao(produto);
        await concluirOrdemProducao(produto, op.cCodIntOP);
      }
    }
  } catch (error) {
    logger.error("Erro ao integrar ordens de produção: " + error);
  }
}

module.exports = { integracaoOP };
