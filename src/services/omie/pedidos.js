const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const { formatarData } = require("../../utils/dateUtils");

async function incluirPedido(pedido) {
  try {
    const valorProdutos = pedido.produtos.reduce((total, produto) => {
      return total + produto.quantidade * produto.valorUnitario;
    }, 0);

    const param = [
      {
        cabecalho: {
          codigo_cliente_integracao: pedido.codigoCliente,
          codigo_pedido_integracao: `${pedido.idPedido}a`,
          data_previsao: formatarData(pedido.dataPedido),
          etapa: 10,
          numero_pedido: "",
          codigo_parcela: "000",
        },
        det: pedido.produtos.map((produto) => ({
          ide: {
            codigo_item_integracao: produto.idPedidoProduto,
          },
          inf_adic: {
            peso_bruto: 0,
            peso_liquido: 0,
          },
          produto: {
            cfop: produto.cfop,
            codigo_produto: produto.codigoProduto,
            descricao: produto.nomeProduto,
            ncm: produto.ncm,
            quantidade: produto.quantidade,
            tipo_desconto: "",
            unidade: produto.unidade,
            valor_desconto:
              produto.valorDescontoProduto +
              (pedido.valorDescontoPedido / valorProdutos) *
                (produto.valorUnitario * produto.quantidade),
            valor_unitario: produto.valorUnitario,
          },
        })),
        frete: {
          modalidade: process.env.OMIE_MODALIDADE_FRETE,
          valor_frete: pedido.valorTaxaEntrega,
          veiculo_proprio: "N",
        },
        informacoes_adicionais: {
          codigo_categoria: process.env.OMIE_CODIGO_CATEGORIA,
          codigo_conta_corrente: process.env.OMIE_CONTA_CORRENTE,
          consumidor_final: "S",
          enviar_email: "N",
        },
      },
    ];

    const body = {
      call: "IncluirPedido",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    console.log(JSON.stringify(body, null, 2));

    // const response = await apiOmie.post("geral/pedidos/", body);
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.faultstring.includes("Pedido já cadastrado")
    ) {
      console.log(`Pedido ${pedido.idPedido} já está cadastrado.`);
    } else {
      throw error;
    }
  }
}

module.exports = { incluirPedido };
