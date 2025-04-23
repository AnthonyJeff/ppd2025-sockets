const board = document.getElementById('game-board');
const turnInfo = document.getElementById('turn-info');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-msg');
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnDesistir = document.getElementById('btn-desistir');

let currentPlayer = 1;
let player1Count = 0;
let player2Count = 0;
const maxPieces = 12;
let placingPhase = true;
let selectedCell = null;
let firstMoveDone = false;


let localPlayer = null;
while (localPlayer !== "1" && localPlayer !== "2") {
  localPlayer = prompt("Você é o Jogador 1 ou 2? (Digite 1 ou 2)");
}
localPlayer = parseInt(localPlayer);

// Altera o título da aba
document.title = `Seega Online - Jogador ${localPlayer}`;

// WebSocket via JavaScritp em comunicação com o server
const socket = new WebSocket("ws://localhost:8080");

// Objeto do tipo Socket
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Chat  
  if (data.type === "chat") {
    appendChatMessage(data.message);
  }

  // Movimentos das peças
  if (data.type === "move") {
    moveRemotePiece(data.from, data.to, data.player);
    currentPlayer = data.player === 1 ? 2 : 1;
    updateTurnDisplay();
  }

  // Posicionamentos das Peças  
  if (data.type === "place") {
    const cell = document.getElementById(`cell-${data.row}-${data.col}`);
    if (cell && !cell.classList.contains("player1") && !cell.classList.contains("player2")) {
      cell.classList.add(`player${data.player}`);
    }
    player1Count = data.p1;
    player2Count = data.p2;
    currentPlayer = data.nextPlayer;
    updateTurnDisplay();
    updateScore();
  }

  // Iniciando a fase de Movimentação  
  if (data.type === "start_movement_phase") {
    placingPhase = false;
    const center = document.getElementById("cell-2-2");
    //center.style.backgroundColor = "#f0f0f0";
    center.style.backgroundColor = "";
    center.style.border = "2px dashed #999";
    center.style.cursor = "pointer";
    delete center.dataset.blocked;
    updateTurnDisplay();
    alert("Fase de movimentação iniciada!");
  }

  // Botão de Reiniciar a partida  
  if (data.type === "restart") {
    alert("Jogador " + data.winner + " venceu! Seu adversário reiniciou a partida.");
    location.reload();
  }

  if (data.type === "status") {
    if (localPlayer === 1 && data.connected === 1) {
      const waiting = document.createElement("div");
      waiting.className = "text-muted mt-2";
      waiting.id = "waiting-msg";
      waiting.innerText = "⏳ Aguardando outro jogador...";
      document.body.appendChild(waiting);
    } else {
      const waiting = document.getElementById("waiting-msg");
      if (waiting) {
        waiting.remove();
        alert("✅ Jogador 2 conectou. A partida pode começar!");
      }
    }
  }
  
  if (data.type === "player_disconnected") {
    alert("🏆 O outro jogador se desconectou. Você venceu por abandono!");
    disableBoard();
  }

  if (data.type === "withdrawal") {
    alert(`🏆 Jogador ${data.winner} venceu! O outro jogador desistiu da partida.`);
    disableBoard();
  }


};

socket.onerror = () => {
  alert("Erro na conexão com o servidor WebSocket.");
  disableBoard();
};

socket.onclose = () => {
  alert("Conexão com o servidor foi encerrada. O jogo foi interrompido.");
  disableBoard();
};


// Função que envia pro socket a mensagem pra o chat 
function sendChat(msg) {
  socket.send(JSON.stringify({ type: "chat", message: msg }));
}

// function appendChatMessage(msg) {
//   chatBox.innerHTML += msg + "<br>";
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// function appendChatMessage(msg) {
//   const now = new Date();
//   const hour = now.getHours().toString().padStart(2, '0');
//   const min = now.getMinutes().toString().padStart(2, '0');
//   const time = `${hour}:${min}`;

//   const color = msg.includes("Jogador 1") ? "text-primary" : "text-danger";

//   chatBox.innerHTML += `
//     <div class="${color}">
//       <small class="text-muted">[${time}]</small> ${msg}
//     </div>
//   `;
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// Função que inclui visuamente a mensagem no layout do chat
function appendChatMessage(msg) {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const time = `${hour}:${min}`;

  const isPlayer1 = msg.includes("Jogador 1");
  const bubbleClass = isPlayer1 ? "bubble-left" : "bubble-right";

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", bubbleClass);

  bubble.innerHTML = `
    ${msg}
    <span class="chat-time">${time}</span>
  `;

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}


sendBtn.addEventListener('click', () => {
  if (chatInput.value.trim()) {
    sendChat("Jogador " + localPlayer + ": " + chatInput.value.trim());
    chatInput.value = "";
  }
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

// Função que envia o movimento da peça no tabuleiro para o socket
function sendMove(from, to, player) {
  socket.send(JSON.stringify({
    type: "move",
    from: from,
    to: to,
    player: player
  }));
}

// Envia os posicionamentos
function sendPlacement(row, col, player) {
  const nextPlayer = player === 1 ? 2 : 1;
  socket.send(JSON.stringify({
    type: "place",
    row: row,
    col: col,
    player: player,
    nextPlayer: nextPlayer,
    p1: player1Count,
    p2: player2Count
  }));
}

// Montagem do tabuleiro
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = `cell-${i}-${j}`;
    cell.dataset.row = i;
    cell.dataset.col = j;

    if (i === 2 && j === 2) {
      cell.style.backgroundColor = "#ccc";
      cell.style.cursor = "not-allowed";
      cell.dataset.blocked = "true";
    }

    cell.onclick = () => handleCellClick(cell, i, j);
    board.appendChild(cell);
  }
}

function handleCellClick(cell, row, col) {
  if (cell.dataset.blocked === "true") return;

  if (placingPhase) {
    if (currentPlayer !== localPlayer) return;
    if (cell.classList.contains('player1') || cell.classList.contains('player2')) return;

    if (localPlayer === 1 && player1Count < maxPieces) {
      cell.classList.add('player1');
      player1Count++;
      sendPlacement(row, col, 1);
      currentPlayer = 2;
    } else if (localPlayer === 2 && player2Count < maxPieces) {
      cell.classList.add('player2');
      player2Count++;
      sendPlacement(row, col, 2);
      currentPlayer = 1;
    }

    updateTurnDisplay();

    if (player1Count === maxPieces && player2Count === maxPieces) {
      placingPhase = false;
      const center = document.getElementById("cell-2-2");
      delete center.dataset.blocked;
      //center.style.backgroundColor = "#f0f0f0";
      center.style.backgroundColor = "";
      center.style.border = "2px dashed #999";
      center.style.cursor = "pointer";
      updateTurnDisplay();
      socket.send(JSON.stringify({ type: "start_movement_phase" }));
    }

    return;
  }

  if (!placingPhase) {
    if (currentPlayer !== localPlayer) return;

    const isOwnPiece = cell.classList.contains(`player${localPlayer}`);

    if (isOwnPiece) {
      if (selectedCell) selectedCell.classList.remove('selected');
      selectedCell = cell;
      selectedCell.classList.add('selected');
      return;
    }

    if (selectedCell && !cell.classList.contains('player1') && !cell.classList.contains('player2')) {
      const fromRow = parseInt(selectedCell.dataset.row);
      const fromCol = parseInt(selectedCell.dataset.col);
      const isAdjacent = Math.abs(fromRow - row) + Math.abs(fromCol - col) === 1;

      if (!isAdjacent) {
        alert("Você só pode mover para uma casa adjacente!");
        return;
      }

      if (!firstMoveDone && localPlayer === 1 && !(row === 2 && col === 2)) {
        alert("A primeira jogada do Jogador 1 deve ser para o centro!");
        return;
      }


      cell.classList.add(`player${localPlayer}`);
      selectedCell.classList.remove(`player${localPlayer}`);
      selectedCell.classList.remove('selected');

      checkCaptures(row, col, localPlayer);
      updateScore();
      checkEndGame(); // Adicione isso aqui

      sendMove({ row: fromRow, col: fromCol }, { row: row, col: col }, localPlayer);

      selectedCell = null;
      if (localPlayer === 1 && !firstMoveDone) firstMoveDone = true;

    }
  }
}

function moveRemotePiece(from, to, player) {
  const fromCell = document.getElementById(`cell-${from.row}-${from.col}`);
  const toCell = document.getElementById(`cell-${to.row}-${to.col}`);

  if (fromCell && toCell) {
    toCell.classList.add(`player${player}`);
    fromCell.classList.remove(`player${player}`);

    checkCaptures(to.row, to.col, player);
    updateScore();
    checkEndGame(); // Adicione isso aqui também
  }
}

// Lógica de captura das peças
function checkCaptures(row, col, player) {
  const enemy = player === 1 ? 'player2' : 'player1';
  const ally = `player${player}`;

  const directions = [
    { r: -1, c: 0 }, // cima
    { r: 1, c: 0 },  // baixo
    { r: 0, c: -1 }, // esquerda
    { r: 0, c: 1 }   // direita
  ];

  directions.forEach(dir => {
    const r1 = row + dir.r;
    const c1 = col + dir.c;
    const r2 = row + dir.r * 2;
    const c2 = col + dir.c * 2;

    const mid = document.getElementById(`cell-${r1}-${c1}`);
    const far = document.getElementById(`cell-${r2}-${c2}`);

    if (!mid || !far) return;

    if (
      mid.classList.contains(enemy) &&
      far.classList.contains(ally)
    ) {
      mid.classList.remove(enemy);
    }
  });

  updateScore();
}

// Checa o fim da partida
function checkEndGame() {
  const p1Cells = [...document.querySelectorAll('.player1')];
  const p2Cells = [...document.querySelectorAll('.player2')];

  // Se alguém perdeu todas as peças
  if (p1Cells.length === 0) {
    alert("🏆 Jogador 2 venceu! (Jogador 1 não tem mais peças)");
    disableBoard();
    return true;
  }

  if (p2Cells.length === 0) {
    alert("🏆 Jogador 1 venceu! (Jogador 2 não tem mais peças)");
    disableBoard();
    return true;
  }

  // Se alguém está completamente bloqueado
  const isBlocked = (cells) => {
    return cells.every(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      const adjacents = [
        document.getElementById(`cell-${row - 1}-${col}`),
        document.getElementById(`cell-${row + 1}-${col}`),
        document.getElementById(`cell-${row}-${col - 1}`),
        document.getElementById(`cell-${row}-${col + 1}`)
      ];

      return adjacents.every(adj =>
        !adj || adj.classList.contains('player1') || adj.classList.contains('player2')
      );
    });
  };

  if (isBlocked(p1Cells)) {
    alert("🏆 Jogador 2 venceu! (Jogador 1 está bloqueado)");
    disableBoard();
    return true;
  }

  if (isBlocked(p2Cells)) {
    alert("🏆 Jogador 1 venceu! (Jogador 2 está bloqueado)");
    disableBoard();
    return true;
  }

  return false;
}

// function disableBoard() {
//   document.querySelectorAll('.cell').forEach(cell => cell.onclick = null);
// }

function disableBoard() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.onclick = null;
    cell.style.cursor = 'not-allowed';
  });
}

// Atualiza a frase de atualização no layout 
function updateTurnDisplay() {
  if (placingPhase) {
    turnInfo.textContent = `Vez do Jogador ${currentPlayer} (Posicionando peças)`;
  } else {
    turnInfo.textContent = `Vez do Jogador ${currentPlayer} (Movimentando)`;
  }
}

function updateScore() {
  const p1 = document.querySelectorAll('.player1').length;
  const p2 = document.querySelectorAll('.player2').length;
  document.getElementById('score-p1').textContent = p1;
  document.getElementById('score-p2').textContent = p2;
}

// Botão de reiniciar a partida (deprecated)
//btnReiniciar.onclick = () => location.reload();

// Botão de reiniciar a partida
btnReiniciar.onclick = () => {
  const confirmReset = confirm("Deseja realmente reiniciar a partida?\nO outro jogador será declarado vencedor.");
  if (!confirmReset) return;

  const vencedor = localPlayer === 1 ? 2 : 1;

  // Envia aviso ao adversário via WebSocket
  socket.send(JSON.stringify({
    type: "restart",
    winner: vencedor
  }));

  alert("Você reiniciou a partida. Jogador " + vencedor + " venceu.");

  // Reinicia localmente
  location.reload();
};
    

// Botão de desistir
// btnDesistir.onclick = () => {
//   if (confirm("Tem certeza que deseja desistir?")) {
//     alert("Jogador " + (localPlayer === 1 ? 2 : 1) + " venceu!");
//     board.querySelectorAll('.cell').forEach(cell => cell.onclick = null);
//   }
// };

btnDesistir.onclick = () => {
  const confirmar = confirm("Tem certeza que deseja desistir da partida?");
  if (!confirmar) return;

  const vencedor = localPlayer === 1 ? 2 : 1;

  // Envia para o adversário
  socket.send(JSON.stringify({
    type: "withdrawal",
    winner: vencedor
  }));

  alert("Você desistiu. Jogador " + vencedor + " venceu!");
  disableBoard();
};



// Atualiza os turnos no tabuleiro
updateTurnDisplay();
