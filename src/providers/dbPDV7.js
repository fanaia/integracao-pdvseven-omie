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
  requestTimeout: 60000, // tempo limite de 60 segundos
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function executarProc(nomeProcedure, parametros) {
  try {
    const pool = await getPool();
    const request = pool.request();

    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    const result = await request.execute(nomeProcedure);
    return result.recordset;
  } catch (error) {
    console.error("Erro ao executar a stored procedure:", error);
    throw error;
  }
}

async function executarQuery(query, parametros) {
  try {
    const pool = await getPool();
    const request = pool.request();

    for (const parametro of parametros) {
      request.input(parametro.nome, parametro.tipo, parametro.valor);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Erro ao executar a query:", error);
    throw error;
  }
}

module.exports = {
  executarProc,
  executarQuery,
};
