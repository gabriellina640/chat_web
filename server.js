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

// --- CONFIGURAÇÃO DO E-MAIL (Buscando do .env) ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// --- BANCOS DE DADOS EM MEMÓRIA ---
const users = [];
const emailQueue = [];

// --- 2. FILA DE E-MAILS (Roda a cada 30 segundos) ---
setInterval(async () => {
    if (emailQueue.length > 0) {
        console.log('\n[FILA] Processando envios pendentes...');
        
        while (emailQueue.length > 0) {
            const user = emailQueue.shift(); // Remove o primeiro da fila para processar
            
            try {
                await transporter.sendMail({
                    from: '"Sistema Atividade" <sistema@faculdade.com>',
                    to: user.email, 
                    subject: 'Bem-vindo ao Sistema!',
                    text: `Olá, ${user.username}! Seu cadastro foi realizado com sucesso. Bem-vindo(a)!`,
                });
                console.log(`[SUCESSO] E-mail enviado via Mailtrap para: ${user.email}`);
            } catch (error) {
                // Captura o erro (ex: limite da conta do professor) sem travar o servidor
                console.error(`[ERRO] Falha ao enviar para ${user.email}:`, error.message);
            }
        }
        console.log('[FILA] Todos os e-mails processados.\n');
    }
}, 30000);

// --- 1. AUTENTICAÇÃO ---
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ error: 'Usuário ou e-mail já cadastrado.' });
    }

    const newUser = { username, email, password };
    users.push(newUser);

    emailQueue.push(newUser);
    console.log(`[SISTEMA] Usuário ${username} cadastrado. Entrou na fila de e-mail.`);

    res.json({ message: 'Cadastro realizado! O e-mail de boas-vindas chegará em breve.' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ message: 'Login efetuado', username: user.username });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas.' });
    }
});

// --- 3. CHAT EM TEMPO REAL (WebSocket) ---
io.on('connection', (socket) => {
    console.log(`Novo usuário conectado: ${socket.id}`);

    socket.on('chatMessage', (msgData) => {
        io.emit('chatMessage', msgData);
    });

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Aguardando cadastros para testar a fila (a cada 30s)...');
});