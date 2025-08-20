const express = require("express");
const router = express.Router();
const db = require("../db");

// Rota para gerenciar pacientes, criação, leitura, atualização e exclusão
// Métodos HTTP:

router.get("/", (req, res) => {
  db.query("SELECT * FROM paciente", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM paciente WHERE id_paciente = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente não encontrado" });
      }
      res.json(results[0]);
    }
  );
});

router.post("/", (req, res) => {
  const { nome, data_nascimento, CPF, sexo, email, senha, telefone } = req.body;
  const sql = `
    INSERT INTO paciente 
      (nome, data_nascimento, CPF, sexo, email, senha, telefone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nome, data_nascimento, CPF, sexo, email, senha, telefone];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      id_paciente: result.insertId,
      nome,
      data_nascimento,
      CPF,
      sexo,
      email,
      senha,
      telefone,
    });
  });
});

module.exports = router;
