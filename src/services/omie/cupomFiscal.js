const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const { formatarData, formatarHora } = require("../../utils/dateUtils");
const { getMD5, base64ToString } = require("../../utils/hashUtils");

async function incluirCupomFiscal(cupomFiscal) {
  try {
    const valorProdutos = cupomFiscal.produtos.reduce((total, produto) => {
      return total + produto.quantidade * produto.valorUnitario;
    }, 0);

    const param = [
      {
        caixa: {
          lCxAberto: true,
          seqCaixa: cupomFiscal.idCaixa,
          seqCupom: cupomFiscal.chaveConsulta.substring(34, 40),
        },
        cfeSat: {
          chCFe: cupomFiscal.chaveConsulta.replace("CFe", ""),
          dEmi: formatarData(cupomFiscal.dataPedido),
          hEmi: formatarHora(cupomFiscal.dataPedido),
          det: cupomFiscal.produtos.map((produto, index) => ({
            // imposto: {
            //   ICMS: {
            //     CST: produto.pissn_cst,
            //   },
            //   vTotTrib: 0,
            // },
            lCanc: false,
            prod: {
              cUn: produto.unidade,
              vAcresc: 0,
              vDesc:
                produto.valorDescontoProduto +
                (cupomFiscal.valorDescontoPedido / valorProdutos) *
                  (produto.valorUnitario * produto.quantidade),
              vItem:
                produto.quantidade * produto.valorUnitario -
                (produto.valorDescontoProduto +
                  (cupomFiscal.valorDescontoPedido / valorProdutos) *
                    (produto.valorUnitario * produto.quantidade)),
              vProd:
                produto.quantidade * produto.valorUnitario -
                (produto.valorDescontoProduto +
                  (cupomFiscal.valorDescontoPedido / valorProdutos) *
                    (produto.valorUnitario * produto.quantidade)),
              vUnit: produto.valorUnitario,
            },
            prodIdent: {
              emiProduto: produto.codigoProduto,
              idLocalEstoque: process.env.OMIE_LOCAL_ESTOQUE,
              idProduto: produto.codigoProduto,
            },
            seqItem: index + 1,
          })),
          lCanc: false,
          nCFe: cupomFiscal.chaveConsulta.substring(34, 40),
          total: {
            vAcresc: cupomFiscal.valorTaxaEntrega,
            vCF: cupomFiscal.valorTotal,
            vDesc: cupomFiscal.valorDescontoPedido,
            vItem: valorProdutos,
          },
          tpAmb: "P",
        },
        cupomIdent: {
          idCliente: cupomFiscal.idCliente,
        },
        emissor: {
          emiId: process.env.EMISSOR_ID,
          emiNome: process.env.EMISSOR_NOME,
          emiSerial: process.env.EMISSOR_SERIAL,
          emiVersao: process.env.EMISSOR_VERSAO,
        },
        formasPag: cupomFiscal.pagamentos.map((pagamento, index) => ({
          lCanc: false,
          pag: {
            pTaxa: 0,
            vLiq: pagamento.valorPagamento,
            vPag: pagamento.valorPagamento,
            vTaxa: 0,
            vTroco: 0,
          },
          pagIdent: {
            cCategoria: process.env.OMIE_CATEGORIA_PAGAMENTO, // Este valor parece ser fixo, então o mantive como está
            cTipoPag: pagamento.meioPagamento,
            idConta: pagamento.idPedidoPagamento,
          },
          parcelas: [
            {
              dVenc: formatarData(cupomFiscal.dataPedido), // Supondo que a data de vencimento seja a mesma que a data do pedido
              nParc: 1, // Este valor parece ser fixo, então o mantive como está
              vParc: pagamento.valorPagamento,
            },
          ],
          seqPag: index + 1,
        })),
        sat: {
          satMd5: getMD5(base64ToString(cupomFiscal.arquivoCFeSAT)),
          satModelo: process.env.SAT_MODELO,
          satProt: process.env.SAT_PROT,
          satSerie: process.env.SAT_SERIE,
          satSessao: cupomFiscal.numeroSessao,
          satXml: base64ToString(cupomFiscal.arquivoCFeSAT),
        },
      },
    ];

    const body = {
      call: "IncluirCfeSat",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param: param,
    };

    console.log(JSON.stringify(body, null, 2));

    // const response = await apiOmie.post("produtos/cupomfiscalincluir/", body);
    // console.log(response.data);
    // return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { incluirCupomFiscal };
