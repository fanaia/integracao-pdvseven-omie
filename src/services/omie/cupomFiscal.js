const { apiOmie, omieAuth } = require("../../providers/apiOmie");
const { getFormaPagByIdTipoPagamento } = require("../../providers/config");
const { formatarData, formatarHora } = require("../../utils/dateUtils");
const { getMD5, base64ToString } = require("../../utils/hashUtils");

async function incluirCupomFiscal(cupomFiscal) {
  try {
    const valorProdutos = cupomFiscal.produtos.reduce((total, produto) => {
      return total + produto.quantidade * produto.valorUnitario;
    }, 0);

    const groupedProducts = cupomFiscal.produtos.reduce((acc, produto) => {
      const key = `${produto.codigoProduto}-${produto.valorUnitario}`;

      if (!acc[key]) {
        acc[key] = { ...produto };
      } else {
        acc[key].quantidade += produto.quantidade;
      }

      return acc;
    }, {});

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
          det: Object.values(groupedProducts).map((produto, index) => {
            const valorProduto = produto.valorUnitario * produto.quantidade;
            const valorDesconto =
              produto.valorDescontoProduto +
              (cupomFiscal.valorDescontoPedido / valorProdutos) * valorProduto;
            const pValorServico = cupomFiscal.valorServico / valorProdutos;
            const valorServico = (cupomFiscal.valorServico / valorProdutos) * valorProduto;

            const vDesc = 0;
            const vItem = Math.round((valorProduto - valorDesconto + valorServico) * 100) / 100;
            const vProd = Math.round(valorProduto * 100) / 100;

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
            vDesc: 0,
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

            const vTaxa = (pagamento.valorPagamento * formaPag.pTaxa) / 100;
            const vLiq = pagamento.valorPagamento;

            let result = {
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
              seqPag: index + 1,
            };

            if (formaPag.cTipoPag !== "DIN") {
              result.parcelas = [
                {
                  dVenc: formatarData(cupomFiscal.dataPedido),
                  nParc: 1,
                  vParc: pagamento.valorPagamento,
                },
              ];
            }

            return result;
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

    // Ajuste de arredondamento somando a diferença no item de maior valor
    let somaDet = param[0].cfeSat.det.reduce((soma, item) => soma + item.prod.vItem, 0);
    let diferenca = +(cupomFiscal.valorTotal - somaDet).toFixed(2);

    if (diferenca !== 0) {
      let itemDeMaiorValor = param[0].cfeSat.det.reduce(
        (max, item) => (item.prod.vItem > max.prod.vItem ? item : max),
        param[0].cfeSat.det[0]
      );
      itemDeMaiorValor.prod.vItem += diferenca;
    }

    const body = {
      call: "IncluirCfeSat",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param: param,
    };

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("produtos/cupomfiscalincluir/", body);
    return response.data;
  } catch (error) {
    logger.error(
      `Erro ao incluir cupom fiscal idPedido ${cupomFiscal.idPedido} (omie): ${error.response?.data.faultstring}`
    );
  }
}

async function fecharCaixa(caixa) {
  try {
    const param = [
      {
        emissor: {
          emiNome: process.env.EMISSOR_NOME,
          emiVersao: process.env.EMISSOR_VERSAO,
          emiSerial: process.env.EMISSOR_SERIAL,
          emiId: caixa.idPDV,
        },
        seqCaixa: caixa.idCaixa,
        fechamento: {
          dAbertura: formatarData(caixa.dtAbertura),
          hAbertura: formatarHora(caixa.dtAbertura),
          vAbertura: caixa.valorAbertura,
          dFechamento: formatarData(caixa.dtFechamento),
          hFechamento: formatarHora(caixa.dtFechamento),
          vFechamento: caixa.valorFechamento,
        },
      },
    ];

    const body = {
      call: "FecharCaixa",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    // console.log(JSON.stringify(body, null, 2));

    const response = await apiOmie.post("produtos/cupomfiscalincluir/", body);
    return response.data;
  } catch (error) {
    logger.error(
      `Erro ao fechar caixa idCaixa ${caixa.idCaixa} (omie): ${error.response?.data.faultstring}`
    );
  }
}

module.exports = { incluirCupomFiscal, fecharCaixa };
