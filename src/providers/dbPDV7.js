const sql = require("mssql");
const logger = require("./logger");
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

async function executarProc(nomeProcedure) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const result = await request.execute(nomeProcedure);
    return result.recordset;
  } catch (error) {
    logger.error(`Erro ao executar a stored procedure: ${nomeProcedure} \n ${error}`);
    throw error;
  }
}

async function executarQuery(query) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    logger.error(`Erro ao executar a query: ${query} \n ${error}`);
    throw error;
  }
}

module.exports = {
  executarProc,
  executarQuery,
};
