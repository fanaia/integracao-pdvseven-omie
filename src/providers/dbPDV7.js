// conexaoSQL.js
const sql = require("mssql");

const config = {
  user: process.env.PDV7_DB_USER,
  password: process.env.PDV7_DB_PASSWORD,
  server: process.env.PDV7_DB_SERVER,
  database: process.env.PDV7_DB_NAME,
  options: {
    encrypt: true, // Se estiver usando conexão com SSL
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
