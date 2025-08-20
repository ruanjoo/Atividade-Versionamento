const express = require("express");
const router = express.Router();
const db = require("../db");

//métodos http get, post, etc

router.get("/", (req, res) => {
  db.query("SELECT * FROM consulta", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM consulta WHERE id_consulta = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0)
        return res.status(404).json({ message: "Consulta não encontrada" });
      res.json(results[0]);
    }
  );
});

router.post("/", (req, res) => {
  const c = req.body;
  const sql = `
    INSERT INTO consulta (id_paciente, id_medico, data_consulta, status)
    VALUES (?, ?, ?, ?)
  `;
  const vals = [c.id_paciente, c.id_medico, c.data_consulta, c.status];
  db.query(sql, vals, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id_consulta: result.insertId, ...c });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const c = req.body;
  const sql = `
    UPDATE consulta
       SET id_paciente = ?, id_medico = ?, data_consulta = ?, status = ?
     WHERE id_consulta = ?
  `;
  const vals = [c.id_paciente, c.id_medico, c.data_consulta, c.status, id];
  db.query(sql, vals, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ id_consulta: Number(id), ...c });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM consulta WHERE id_consulta = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(204).end();
  });
});

module.exports = router;
