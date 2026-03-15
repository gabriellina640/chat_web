require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// -----------------------------
// CONFIGURAÇÃO SMTP
// -----------------------------
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.error("Erro na conexão SMTP:", error);
  } else {
    console.log("Servidor SMTP conectado com sucesso ✅");
  }
});


// -----------------------------
// "BANCO" EM MEMÓRIA
// -----------------------------
const users = [];
const emailQueue = [];
let sentEmails = 0;


// -----------------------------
// PROCESSADOR DA FILA
// -----------------------------
setInterval(async () => {

  console.log("\n===== FILA DE EMAIL =====");
  console.log("Pendentes:", emailQueue.length);
  console.log("Enviados:", sentEmails);
  console.log("=========================");

  if (emailQueue.length === 0) {
    console.log("Nenhum e-mail para enviar no momento.\n");
    return;
  }

  console.log("\n[FILA] Iniciando processamento...");

  while (emailQueue.length > 0) {

    const user = emailQueue.shift();

    try {

      console.log(`Enviando email para: ${user.email}`);

      await transporter.sendMail({
        from: '"Sistema Atividade" <ykiakao@gmail.com>',
        to: user.email,
        subject: 'Bem-vindo ao Sistema!',
        text: `Olá, ${user.username}! Seu cadastro foi realizado com sucesso. Bem-vindo(a)!`
      });

      sentEmails++;

      console.log(`[SUCESSO] Email enviado para ${user.email}`);

    } catch (error) {

      console.error(`[ERRO] Falha ao enviar para ${user.email}`);
      console.error(error.message);

    }

  }

  console.log("[FILA] Processamento finalizado.\n");

}, 30000); // 30 segundos



// -----------------------------
// REGISTRO
// -----------------------------
app.post('/api/register', (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ error: 'Usuário ou e-mail já cadastrado.' });
  }

  const newUser = { username, email, password };

  users.push(newUser);

  emailQueue.push(newUser);

  console.log(`\n[SISTEMA] Usuário ${username} cadastrado.`);
  console.log(`[FILA] ${userEmail(newUser)} adicionado à fila.`);
  console.log("Fila atual:", emailQueue.length);

  res.json({
    message: 'Cadastro realizado! O e-mail será enviado em breve.'
  });

});

function userEmail(user){
  return user.email;
}


// -----------------------------
// LOGIN
// -----------------------------
app.post('/api/login', (req, res) => {

  const { username, password } = req.body;

  const user = users.find(u =>
    u.username === username && u.password === password
  );

  if (user) {
    res.json({
      message: 'Login efetuado',
      username: user.username
    });
  } else {
    res.status(401).json({
      error: 'Credenciais inválidas.'
    });
  }

});


// -----------------------------
// CHAT TEMPO REAL
// -----------------------------
io.on('connection', (socket) => {

  console.log(`Novo usuário conectado: ${socket.id}`);

  socket.on('chatMessage', (msgData) => {
    io.emit('chatMessage', msgData);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });

});


// -----------------------------
// SERVIDOR
// -----------------------------
const PORT = 3000;

server.listen(PORT, () => {

  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log("Aguardando cadastros para adicionar e-mails na fila...");

});