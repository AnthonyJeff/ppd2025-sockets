# ♟️ Seega Online - Jogo Multiplayer em Tempo Real com Sockets

Este é um jogo Seega Clássico, feito com PHP + WebSocket (Ratchet) + HTML/CSS/JS (Bootstrap), rodando em tempo real entre dois jogadores (no navegador).

## 🎮 Funcionalidades

- Tabuleiro 5x5 com fases de posicionamento e movimentação
- Regras do Seega (incluindo captura, centro, bloqueios)
- Jogadores se alternam colocando 1 peça por turno
- Chat em tempo real
- Detecção de vitória automática por:
  - Captura total
  - Peças bloqueadas
  - Desistência
  - Desconexão
- Totalmente sincronizado entre as abas
- Sistema WebSocket com Ratchet

---

## ⚙️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/AnthonyJeff/ppd2025-sockets
cd ppd2025-sockets
```

### 2. Instalar dependências do servidor WebSocket

É necessário ter o [Composer](https://getcomposer.org/) instalado.

```bash
composer install
```

Isso irá instalar o [Ratchet](http://socketo.me/), a biblioteca WebSocket em PHP.

---

## 🚀 Como rodar o jogo

### 1. Iniciar o servidor WebSocket

```bash
php server/websocket-server.php
```

> 🔁 Ele será iniciado na porta `ws://localhost:8080`

---

### 2. Abrir o jogo em dois navegadores ou abas

Abra o arquivo:

```
public/index.html
```

- Em uma aba: Jogador 1
- Em outra aba: Jogador 2
- O sistema já detecta as conexões automaticamente

---

## 💬 Controles no jogo

- Posicione peças clicando nas casas
- Cada jogador coloca 1 peça por vez
- Após 12 peças, começa a movimentação
- Capture peças flanqueando o inimigo
- Use o chat para conversar em tempo real

---

## 📦 Tecnologias utilizadas

- 🧠 PHP + Ratchet (WebSocket)
- 🎨 HTML5, CSS3, Bootstrap
- ⚡ JavaScript (sem frameworks)
- 💬 Comunicação bidirecional em tempo real

---

## 🛠️ Em desenvolvimento

- Sistema de salas com IDs
- Reconexão de jogadores

---

## 🧑‍💻 Autor

Desenvolvido por **Anthony Jefferson**  
