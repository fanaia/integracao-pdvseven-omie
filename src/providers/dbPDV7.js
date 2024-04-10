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

async function conectar() {
  try {
    await sql.connect(config);
    console.log("Conectado ao SQL Server");
  } catch (error) {
    console.error("Erro ao conectar:", error);
  }
}

async function desconectar() {
  try {
    await sql.close();
    console.log("Desconectado do SQL Server");
  } catch (error) {
    console.error("Erro ao desconectar:", error);
  }
}

module.exports = { conectar, desconectar };