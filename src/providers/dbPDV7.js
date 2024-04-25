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

    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    const result = await request.execute(nomeProcedure);
  } catch (error) {
    console.error("Erro ao executar a stored procedure:", error);
  } finally {
    await sql.close();
  }
}

async function executarQuery(query, parametros) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    await request.query(query);
  } catch (error) {
    console.error("Erro ao executar a query:", error);
  } finally {
    await sql.close();
  }
}

async function executarSelect(query, parametros) {
  let result = null;

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    result = await request.query(query);
  } catch (error) {
    console.error("Erro ao executar o SELECT:", error);
  } finally {
    await sql.close();
  }

  return result.recordset;
}

module.exports = { executarProc, executarQuery, executarSelect };
