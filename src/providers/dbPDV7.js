const sql = require("mssql");

const config = {
  server: process.env.PDV7_DB_SERVER,
  authentication: {
    type: "default",
    options: {
      userName: process.env.PDV7_DB_USER,
      password: process.env.PDV7_DB_PASS,
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    database: process.env.PDV7_DB_NAME,
  },
};

async function executarProc(nomeProcedure, parametros) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Adicione os parâmetros à solicitação
    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    // Execute a stored procedure
    const result = await request.execute(nomeProcedure);

    console.log(result.recordset); // Imprime o resultado da stored procedure
  } catch (error) {
    console.error("Erro ao executar a stored procedure:", error);
  } finally {
    await sql.close();
  }
}

module.exports = { executarProc };
