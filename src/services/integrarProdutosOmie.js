const sql = require("mssql");
const { getConfig, saveConfig } = require("../providers/config");
const { executarProc } = require("../providers/dbPDV7");
const { apiOmie, omieAuth } = require("../providers/apiOmie");

async function integracaoProdutos() {
  const listaProdutos = await listarProdutos();
  await importarProdutos(listaProdutos);
}

async function listarProdutos() {
  try {
    const config = await getConfig();
    console.log(config);

    const param = [
      {
        pagina: 1,
        registros_por_pagina: 50,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N",
        filtrar_por_data_de: config.ultimaIntegracaoProduto.data,
        filtrar_por_hora_de: config.ultimaIntegracaoProduto.hora,
        filtrar_apenas_alteracao: "S",
      },
    ];

    const body = {
      call: "ListarProdutos",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };

    const response = await apiOmie.post("geral/produtos/", body);
    return response.data.produto_servico_cadastro;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.faultstring === "ERROR: Não existem registros para a página [1]!"
    )
      console.log("Sem registros para importar");
    else console.error("Erro ao obter registros da API:", error);

    return [];
  }
}

async function importarProdutos(produtos) {
  try {
    if (!produtos || produtos.length === 0) return;

    for (const produto of produtos) {
      const { descricao, inativo, valor_unitario, codigo_produto } = produto;

      const parametros = [
        { nome: "descricao", tipo: sql.VarChar, valor: descricao },
        { nome: "inativo", tipo: sql.Char, valor: inativo },
        { nome: "codigo_produto", tipo: sql.VarChar, valor: codigo_produto.toString() },
        { nome: "valor_unitario", tipo: sql.Numeric(10, 2), valor: valor_unitario },
      ];
      await executarProc("OmieIntegracaoProduto", parametros);
      console.log(`Produto ${descricao} importado`);
    }

    const config = await getConfig();
    const dataMaisRecente = obterDataMaisRecente(produtos);
    console.log(dataMaisRecente);

    config.ultimaIntegracaoProduto.data = dataMaisRecente.data;
    config.ultimaIntegracaoProduto.hora = dataMaisRecente.hora;
    saveConfig(config);
  } catch (error) {
    console.error("Erro ao processar produtos:", error);
  }
}

function obterDataMaisRecente(produtos) {
  let dataMaisRecente = null;
  let data;
  let hora;

  produtos.forEach((produto) => {
    const { dAlt, hAlt } = produto.info;
    const dataString = `${dAlt} ${hAlt}`; // Concatenando data e hora
    const dataAtual = new Date(dataString);

    if (!dataMaisRecente || dataAtual > dataMaisRecente) {
      dataMaisRecente = dataAtual;
      data = dAlt;
      hora = hAlt;
    }
  });

  return { data, hora };
}

module.exports = { integracaoProdutos };
