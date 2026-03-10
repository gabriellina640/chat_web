# Atividade 03 — Sistema de Login, Fila de E-mails e Chat em Tempo Real

Este projeto foi desenvolvido para cumprir os requisitos da Atividade 03, construindo um sistema simples e funcional focado em autenticação, processamento em segundo plano (fila) e comunicação via WebSockets.

## 🚀 Funcionalidades Implementadas

O sistema atende rigorosamente ao escopo solicitado:

1. **Autenticação Simples:**
   - Cadastro de usuário (com e-mail obrigatório).
   - Login validando credenciais.
   - Logout seguro (limpando a tela do chat).
   - *Nota: Os dados são armazenados em memória (Arrays) para manter a simplicidade exigida.*

2. **Envio de E-mail com Fila:**
   - Ao realizar o cadastro, o usuário é adicionado a uma fila (`emailQueue`).
   - Um processo em segundo plano (`setInterval`) roda a cada **30 segundos** processando a fila.
   - O e-mail de boas-vindas é disparado utilizando o **Nodemailer** integrado à API de testes **Mailtrap**.

3. **Chat em Tempo Real (WebSockets):**
   - Utilização da biblioteca **Socket.io**.
   - Apenas usuários logados têm acesso à interface do chat.
   - Mensagens enviadas são retransmitidas instantaneamente para todos os clientes conectados.
   - Interface com layout amigável (estilo balões de mensagens) para diferenciar remetente e destinatário.

## 🛠️ Tecnologias Utilizadas

- **Node.js** (Ambiente de execução)
- **Express** (Servidor HTTP e roteamento)
- **Socket.io** (Comunicação bidirecional em tempo real)
- **Nodemailer** (Envio de e-mails via SMTP/Mailtrap)
- **HTML/CSS/JS Puro (Vanilla)** (Frontend simples, sem frameworks adicionais)

## ⚙️ Como executar o projeto localmente

Siga os passos abaixo para testar o sistema na sua máquina:

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu computador.

### 2. Instalação das dependências
Abra o terminal na pasta raiz do projeto e execute o comando:
```bash
npm install