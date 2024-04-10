const { apiOmie, omieAuth } = require('../providers/apiOmie');

async function listarProdutos() {
  try {
    const param = [{
    }]

    const body = {
      call: "ConsultarOS",
      app_key: omieAuth.appKey,
      app_secret: omieAuth.appSecret,
      param,
    };
    
    const response = await apiOmie.post("servicos/os/", body);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter registros da API:', error);
    return [];
  }
}

async function importarProdutos(registros) {
  try {
    for (const registro of registros) {
      const { campo1, campo2, campo3, campo4 } = registro;
      // Chamar a procedure do SQL Server com os campos como parâmetros
      await sql.query`EXEC suaProcedure @parametro1=${campo1}, @parametro2=${campo2}, @parametro3=${campo3}, @parametro4=${campo4}`;
      
      console.log('Registro processado:', registro);
    }
  } catch (error) {
    console.error('Erro ao processar registros:', error);
  }
}

module.exports = { listarProdutos, importarProdutos };
