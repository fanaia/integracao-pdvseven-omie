const { executarQuery } = require("../../providers/dbPDV7");

async function listarPedidos(idCaixa) {
  try {
    const sql = `
      SELECT
        cx.IDCaixa AS 'idCaixa',
        cx.IDPDV AS 'idPDV',
        pe.IDPedido AS 'idPedido',
        ISNULL(pe.ValorDesconto, 0) AS 'valorDescontoPedido',
        ISNULL(pe.ValorEntrega, 0) AS 'valorTaxaEntrega',
        ISNULL(pe.ValorServico, 0) AS 'valorServico',
        pe.ValorTotal AS 'valorTotal',
        cl.NomeCompleto AS 'nomeCliente',
        cl.IDCliente AS 'idCliente',
        cl.Email AS 'emailCliente',
        pe.dtPedidoFechamento AS 'dataPedido',
        rs.arquivoCFeSAT as 'arquivoCFeSAT',

        pp.IDPedidoProduto AS 'idPedidoProduto',
        p.IDProduto AS 'idProduto',
        p.Nome AS 'nomeProduto',
        cf.NCM AS 'ncm',
        tt.CFOP AS 'cfop',
        tt.PISSN_CST AS 'pissn_cst',
        rs.chaveConsulta AS 'chaveConsulta',
        rs.numeroSessao AS 'numeroSessao',
        p.Codigo AS 'codigoProduto',
        u.Simbolo AS 'unidade',
        ISNULL(pp.ValorDesconto, 0) AS 'valorDescontoProduto',
        pp.ValorUnitario AS 'valorUnitario',
        pp.Quantidade AS 'quantidade',
        pp.DtInclusao AS 'dtInclusaoProduto',

        pg.IDPedidoPagamento AS 'idPedidoPagamento',
        pg.IDTipoPagamento as 'idTipoPagamento',
        pg.Valor AS 'valorPagamento'
      FROM
        tbCaixa cx (NOLOCK)
        LEFT JOIN tbPedido pe (NOLOCK) ON pe.IDCaixa=cx.IDCaixa
        LEFT JOIN tbRetornoSAT rs (NOLOCK) ON rs.IDRetornoSAT=pe.IDRetornoSAT_venda
        INNER JOIN tbPedidoProduto pp (NOLOCK) ON pp.IDPedido=pe.IDPedido
        INNER JOIN tbPedidoPagamento pg (NOLOCK) ON pg.IDPedido=pe.IDPedido
        INNER JOIN tbCliente cl (NOLOCK) ON cl.IDCliente=pe.IDCliente
        LEFT JOIN tbProduto p (NOLOCK) ON p.IDProduto=pp.IDProduto
        LEFT JOIN tbUnidade u (NOLOCK) ON u.IDUnidade=p.IDUnidade
        LEFT JOIN tbTipoPagamento tp (NOLOCK) ON tp.IDTipoPagamento=pg.IDTipoPagamento
        LEFT JOIN tbClassificacaoFiscal cf (NOLOCK) ON cf.IDClassificacaoFiscal=p.IDClassificacaoFiscal
        LEFT JOIN tbTipoTributacao tt (NOLOCK) ON tt.IDTipoTributacao=cf.IDTipoTributacao
      WHERE
        pe.IDCaixa=${idCaixa}
        AND pe.IDStatusPedido=40
        AND pp.Cancelado=0
        AND pp.IDProduto<>4
        AND pp.ValorUnitario>0
        AND pg.Excluido=0
      ORDER BY 
        pe.IDPedido,
        pp.IDPedidoProduto
    `;
    // AND pe.IDPedido=60231

    const result = await executarQuery(sql, []);

    const pedidos = {};

    result.forEach((row) => {
      if (!pedidos[row.idPedido]) {
        pedidos[row.idPedido] = {
          idCaixa: row.idCaixa,
          idPDV: row.idPDV,
          idPedido: row.idPedido,
          valorDescontoPedido: row.valorDescontoPedido,
          valorTaxaEntrega: row.valorTaxaEntrega,
          valorServico: row.valorServico,
          valorTotal: row.valorTotal,
          nomeCliente: row.nomeCliente,
          idCliente: row.idCliente,
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
          idProduto: row.idProduto,
          nomeProduto: row.nomeProduto,
          ncm: row.ncm,
          cfop: row.cfop,
          pissn_cst: row.pissn_cst,
          codigoProduto: row.codigoProduto,
          unidade: row.unidade,
          valorDescontoProduto: row.valorDescontoProduto,
          valorUnitario: row.valorUnitario,
          quantidade: row.quantidade,
          dtInclusaoProduto: row.dtInclusaoProduto,
        });
      }

      const isPagamentoAlreadyAdded = pedidos[row.idPedido].pagamentos.some(
        (pagamento) => pagamento.idPedidoPagamento === row.idPedidoPagamento
      );
      if (!isPagamentoAlreadyAdded) {
        pedidos[row.idPedido].pagamentos.push({
          idPedidoPagamento: row.idPedidoPagamento,
          idTipoPagamento: row.idTipoPagamento,
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
