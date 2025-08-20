const mysql = require("mysql2");

// Configuração do pool de conexões MySQL

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "clinica_db",
});

module.exports = pool;
