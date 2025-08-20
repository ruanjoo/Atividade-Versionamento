const express = require("express");
const routerMed = express.Router();
const db = require("../db");

routerMed.get("/", (req, res) => {
  db.query("SELECT * FROM medico", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

routerMed.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM medico WHERE id_medico = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (!results.length)
      return res.status(404).json({ message: "Médico não encontrado" });
    res.json(results[0]);
  });
});

routerMed.post("/", (req, res) => {
  const m = req.body;
  const sql = `INSERT INTO medico (nome, email, senha, telefone, especialidade, CRM, CPF)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const vals = [
    m.nome,
    m.email,
    m.senha,
    m.telefone,
    m.especialidade,
    m.CRM,
    m.CPF,
  ];
  db.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id_medico: result.insertId, ...m });
  });
});

routerMed.put("/:id", (req, res) => {
  const { id } = req.params;
  const m = req.body;
  db.query(
    "UPDATE medico SET nome=?, email=?, senha=?, telefone=?, especialidade=?, CRM=?, CPF=? WHERE id_medico=?",
    [m.nome, m.email, m.senha, m.telefone, m.especialidade, m.CRM, m.CPF, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ id_medico: +id, ...m });
    }
  );
});

routerMed.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM medico WHERE id_medico=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(204).end();
  });
});

module.exports = routerMed;
