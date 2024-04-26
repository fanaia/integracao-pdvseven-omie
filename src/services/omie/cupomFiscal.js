const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const { getFormaPagByIdTipoPagamento } = require("../../providers/config");
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
          det: cupomFiscal.produtos.map((produto, index) => {
            const valorProduto = produto.valorUnitario * produto.quantidade;
            const valorDesconto =
              produto.valorDescontoProduto +
              (cupomFiscal.valorDescontoPedido / valorProdutos) * valorProduto;
            const valorServico = (cupomFiscal.valorServico / valorProdutos) * valorProduto;

            const vDesc = valorDesconto;
            const vItem = valorProduto - valorDesconto + valorServico;
            const vProd = valorProduto - valorDesconto;

            return {
              lCanc: false,
              prod: {
                cUn: produto.unidade,
                vAcresc: 0,
                vDesc: vDesc,
                vItem: vItem,
                vProd: vProd,
                vUnit: produto.valorUnitario,
              },
              prodIdent: {
                emiProduto: produto.codigoProduto,
                idLocalEstoque: process.env.OMIE_LOCAL_ESTOQUE,
                idProduto: produto.codigoProduto,
              },
              seqItem: index + 1,
            };
          }),
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
          emiId: cupomFiscal.idPDV,
          emiNome: process.env.EMISSOR_NOME,
          emiSerial: process.env.EMISSOR_SERIAL,
          emiVersao: process.env.EMISSOR_VERSAO,
        },
        formasPag: await Promise.all(
          cupomFiscal.pagamentos.map(async (pagamento, index) => {
            const formaPag = await getFormaPagByIdTipoPagamento(pagamento.idTipoPagamento);

            const vTaxa = pagamento.valorPagamento * formaPag.pTaxa;
            const vLiq = pagamento.valorPagamento - vTaxa;

            return {
              lCanc: false,
              pag: {
                pTaxa: formaPag.pTaxa,
                vTaxa: vTaxa,
                vPag: pagamento.valorPagamento,
                vLiq: vLiq,
                vTroco: 0,
              },
              pagIdent: {
                cCategoria: formaPag.cCategoria,
                cTipoPag: formaPag.cTipoPag,
                idConta: formaPag.idConta,
              },
              parcelas: [
                {
                  dVenc: formatarData(cupomFiscal.dataPedido),
                  nParc: 1,
                  vParc: pagamento.valorPagamento,
                },
              ],
              seqPag: index + 1,
            };
          })
        ),
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

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("produtos/cupomfiscalincluir/", body);
    console.log(response.data?.faultstring);
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { incluirCupomFiscal };
