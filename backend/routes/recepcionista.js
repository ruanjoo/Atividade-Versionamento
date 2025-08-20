const express = require("express");
const routerUsu = express.Router();
const db = require("../db");

routerUsu.get("/", (req, res) => {
  db.query("SELECT * FROM recepcionista", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

routerUsu.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM recepcionista WHERE id_recepcionista = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (!results.length)
        return res.status(404).json({ message: "Usuário não encontrado" });
      res.json(results[0]);
    }
  );
});

routerUsu.post("/", (req, res) => {
  const u = req.body;
  const sql = `INSERT INTO recepcionista (nome, email, senha)
               VALUES (?, ?, ?)`;
  const vals = [u.nome, u.email, u.senha];
  db.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id_recepcionista: result.insertId, ...u });
  });
});

routerUsu.put("/:id", (req, res) => {
  const { id } = req.params;
  const u = req.body;
  db.query(
    "UPDATE recepcionista SET nome=?, email=?, senha=? WHERE id_recepcionista=?",
    [u.nome, u.email, u.senha, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ id_recepcionista: +id, ...u });
    }
  );
});

routerUsu.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM recepcionista WHERE id_recepcionista=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(204).end();
  });
});

module.exports = routerUsu;
