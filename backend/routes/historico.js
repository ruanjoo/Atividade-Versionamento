const express = require("express");
const routerHis = express.Router();
const db = require("../db");

routerHis.get("/", (req, res) => {
  db.query("SELECT * FROM historico", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

routerHis.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM historico WHERE id_historicoconsulta = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (!results.length)
        return res.status(404).json({ message: "Histórico não encontrado" });
      res.json(results[0]);
    }
  );
});

routerHis.post("/", (req, res) => {
  const h = req.body;
  const sql = `INSERT INTO historico (id_consulta) VALUES (?)`;
  db.query(sql, [h.id_consulta], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id_historicoconsulta: result.insertId, ...h });
  });
});

module.exports = routerHis;
