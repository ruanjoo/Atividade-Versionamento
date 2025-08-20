const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const db = require("../db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "email l@gmail.com",     
    pass: "app-password",     
  },
});

transporter.verify((err, success) => {
  if (err) console.error("[nodemailer] erro de configuração:", err);
  else console.log("[nodemailer] SMTP pronto para envio");
});


router.post("/consulta/:id", (req, res) => {
  console.log(`[BACKEND] POST /consulta/${req.params.id} chamado`, req.body);

  const { id } = req.params; // ID da consulta
  const { subject } = req.body;

  const sql = `
    SELECT 
      p.nome AS paciente_nome, p.email AS paciente_email,
      m.nome AS medico_nome, m.especialidade,
      c.data_consulta
    FROM consulta c
    JOIN paciente p ON c.id_paciente = p.id_paciente
    JOIN medico m ON c.id_medico = m.id_medico
    WHERE c.id_consulta = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("[BACKEND] erro na query de consulta:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      console.log("[BACKEND] consulta não encontrada, id=", id);
      return res.status(404).json({ message: "Consulta não encontrada" });
    }

    const {
      paciente_nome,
      paciente_email,
      medico_nome,
      especialidade,
      data_consulta,
    } = results[0];

    const dt = new Date(data_consulta);
    const dataFormatada = dt.toLocaleDateString("pt-BR");
    const horaFormatada = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const textoEmail = `
Olá ${paciente_nome},

Sua consulta foi agendada com o(a) Dr(a). ${medico_nome} (${especialidade}).

Data: ${dataFormatada}
Horário: ${horaFormatada}

Qualquer dúvida, entre em contato conosco.

Atenciosamente,
Clínica Health-Easy
    `;

    transporter.sendMail(
      {
        from: "sua-clinica@gmail.com",
        to: paciente_email,
        subject: subject || "Notificação de Consulta Agendada",
        text: textoEmail.trim(),
      },
      (error, info) => {
        if (error) {
          console.error("[BACKEND] erro ao enviar e-mail:", error);
          return res.status(500).json({ error: "Erro ao enviar e-mail." });
        }
        console.log(`[BACKEND] e-mail enviado para ${paciente_email}:`, info.response);
        res.json({ message: "E-mail enviado com sucesso!", info });
      }
    );
  });
});

module.exports = router;