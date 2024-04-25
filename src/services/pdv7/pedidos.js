const { executarSelect } = require("../../providers/dbPDV7");

async function listarPedidos(ultimaIntegracaoPedidos) {
  try {
    const sql = `
      SELECT
        cx.IDCaixa AS 'idCaixa',
        pe.IDPedido AS 'idPedido',
        pe.ValorDesconto AS 'valorDescontoPedido',
        pe.ValorEntrega AS 'valorTaxaEntrega',
        pe.ValorTotal AS 'valorTotal',
        cl.NomeCompleto AS 'nomeCliente',
        cl.IDCliente AS 'codigoCliente',
        cl.Email AS 'emailCliente',
        pe.dtPedidoFechamento AS 'dataPedido',
        rs.arquivoCFeSAT as 'arquivoCFeSAT',

        pp.IDPedidoProduto AS 'idPedidoProduto',
        p.Nome AS 'nomeProduto',
        b.NCM AS 'ncm',
        c.CFOP AS 'cfop',
        c.PISSN_CST AS 'pissn_cst',
        rs.chaveConsulta AS 'chaveConsulta',
        rs.numeroSessao AS 'numeroSessao',
        p.Codigo AS 'codigoProduto',
        u.Simbolo AS 'unidade',
        ISNULL(pp.ValorDesconto, 0) AS 'valorDescontoProduto',
        pp.ValorUnitario AS 'valorUnitario',
        pp.Quantidade AS 'quantidade',

        pg.IDPedidoPagamento AS 'idPedidoPagamento',
        tp.CodigoImpressoraFiscal as 'meioPagamento',
        pg.Valor AS 'valorPagamento'
      FROM
        tbProduto p
        INNER JOIN tbPedidoProduto pp ON pp.IDProduto = p.IDProduto
        INNER JOIN tbPedido pe ON pe.IDPedido = pp.IDPedido
        INNER JOIN tbPedidoPagamento pg ON pg.IDPedido=pe.IDPedido
        INNER JOIN tbTipoPagamento tp ON tp.IDTipoPagamento=pg.IDTipoPagamento
        INNER JOIN tbClassificacaoFiscal b ON p.IDClassificacaoFiscal = b.IDClassificacaoFiscal
        INNER JOIN tbTipoTributacao c ON c.IDTipoTributacao = b.IDTipoTributacao
        INNER JOIN tbUnidade u ON u.IDUnidade = p.IDUnidade
        INNER JOIN tbRetornoSAT rs ON rs.IDRetornoSAT=pe.IDRetornoSAT_venda
        INNER JOIN tbCaixa cx ON cx.IDCaixa=pe.IDCaixa
        LEFT JOIN tbCliente cl ON cl.IDCliente = pe.IDCliente
      WHERE
        pe.IDStatusPedido=40
        AND pg.Excluido=0
        AND pe.idPedido=502331`;
    // p.DtPedidoFechamento > '${ultimaIntegracaoPedidos.toISOString()}'`;

    const result = await executarSelect(sql, []);

    const pedidos = {};

    result.forEach((row) => {
      if (!pedidos[row.idPedido]) {
        pedidos[row.idPedido] = {
          idCaixa: row.idCaixa,
          idPedido: row.idPedido,
          valorDescontoPedido: row.valorDescontoPedido,
          valorTaxaEntrega: row.valorTaxaEntrega,
          valorTotal: row.valorTotal,
          nomeCliente: row.nomeCliente,
          codigoCliente: row.codigoCliente,
          emailCliente: row.emailCliente,
          dataPedido: row.dataPedido,
          chaveConsulta: row.chaveConsulta,
          numeroSessao: row.numeroSessao,
          arquivoCFeSAT: row.arquivoCFeSAT,
          produtos: [],
          pagamentos: [],
        };
      }

      const isProdutoAlreadyAdded = pedidos[row.idPedido].produtos.some(
        (produto) => produto.idPedidoProduto === row.idPedidoProduto
      );
      if (!isProdutoAlreadyAdded) {
        pedidos[row.idPedido].produtos.push({
          idPedidoProduto: row.idPedidoProduto,
          nomeProduto: row.nomeProduto,
          ncm: row.ncm,
          cfop: row.cfop,
          pissn_cst: row.pissn_cst,
          codigoProduto: row.codigoProduto,
          unidade: row.unidade,
          valorDescontoProduto: row.valorDescontoProduto,
          valorUnitario: row.valorUnitario,
          quantidade: row.quantidade,
        });
      }

      const isPagamentoAlreadyAdded = pedidos[row.idPedido].pagamentos.some(
        (pagamento) => pagamento.idPedidoPagamento === row.idPedidoPagamento
      );
      if (!isPagamentoAlreadyAdded) {
        pedidos[row.idPedido].pagamentos.push({
          idPedidoPagamento: row.idPedidoPagamento,
          meioPagamento: row.meioPagamento,
          valorPagamento: row.valorPagamento,
        });
      }
    });

    return Object.values(pedidos);
  } catch (error) {
    console.error(`Erro ao listar pedidos: ${error}`);
  }
}

module.exports = { listarPedidos };
