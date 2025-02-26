// Global variables
let players = [];
let isRolling = false;

// Fetch players data from server
async function fetchPlayers() {
  try {
    const response = await fetch('/api/players');
    players = await response.json();
    updateScoreTable();
    renderPawns();
    return players;
  } catch (error) {
    console.error('Error fetching players:', error);
  }
}

// Update score table with current data
function updateScoreTable() {
  players.forEach(player => {
    const row = document.querySelector(`#score-table tr[data-player-id="${player.id}"]`);
    if (row) {
      row.querySelector('.player-result').textContent = player.result;
    }
  });
}

// Generate pawns dynamically
function renderPawns() {
  const pawnContainer = document.querySelector('.pawns');
  pawnContainer.innerHTML = '';
  
  players.forEach(player => {
    const pawn = document.createElement('div');
    pawn.classList.add('pawn');
    pawn.setAttribute('data-player-id', player.id);
    pawn.setAttribute('data-position', player.result);
    pawn.style.backgroundColor = player.color;
    pawn.style.clipPath = getMathShape(player.shape);
    
    const playerName = document.createElement('span');
    playerName.textContent = player.name;
    playerName.style.color = 'white';
    playerName.style.position = 'absolute';
    playerName.style.width = '100%';
    playerName.style.textAlign = 'center';
    playerName.style.top = '50%';
    playerName.style.transform = 'translateY(-50%)';
    
    pawn.appendChild(playerName);
    pawnContainer.appendChild(pawn);
    updatePawnPosition(pawn, player.result);
  });
}

// Function to get math shape
function getMathShape(shape) {
  const shapes = {
    circle: 'circle(50%)',
    square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
  };
  return shapes[shape] || shapes.circle;
}

// Update pawn positions based on player data
function updatePawnPosition(pawn, position) {
  const cell = document.querySelectorAll('.cell')[position];
  if (!cell) return;
  
  pawn.style.left = `${cell.offsetLeft + 10}px`;
  pawn.style.top = `${cell.offsetTop + 10}px`;
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  fetchPlayers();
});


// Define the spiral snake path coordinates (x, y positions for each cell)
const pathCoordinates = [
  { x: 100, y: 40, special: 'start' }, // 0

  { x: 185, y: 50 },  // 1
  { x: 250, y: 50 },  // 2
  { x: 315, y: 50 },  // 3
  { x: 380, y: 50 },  // 4
  { x: 445, y: 50 },  // 5
  { x: 510, y: 50 },  // 6
  { x: 575, y: 50 },  // 7
  { x: 640, y: 50 },  // 8

  { x: 640, y: 115 },  // 9
  { x: 640, y: 180 },  // 10
  { x: 640, y: 245 },  // 11
  { x: 640, y: 310 },  // 12
  { x: 640, y: 375 },  // 13
  { x: 640, y: 440 },  // 14
  { x: 640, y: 505 },  // 15

  { x: 640, y: 570 },  // 16
  { x: 575, y: 570 },  // 17
  { x: 510, y: 570 },  // 18
  { x: 445, y: 570 },  // 19
  { x: 380, y: 570 },  // 20
  { x: 315, y: 570 },  // 21
  { x: 250, y: 570 },  // 22
  { x: 185, y: 570 },  // 23
  { x: 120, y: 570 },  // 24
  { x: 55, y: 570 },  // 25

  { x: 55, y: 505 },  // 26
  { x: 55, y: 440 },  // 27
  { x: 55, y: 375 },  // 28
  { x: 55, y: 310 },  // 29
  { x: 55, y: 245 },  // 30
  { x: 55, y: 180 },  // 31

  { x: 120, y: 180 },  // 32
  { x: 185, y: 180 },  // 33
  { x: 250, y: 180 },  // 34
  { x: 315, y: 180 },  // 35
  { x: 380, y: 180 },  // 36
  { x: 445, y: 180 },  // 37
  { x: 510, y: 180 },  // 38

  { x: 510, y: 245 },  // 39
  { x: 510, y: 310 },  // 40
  { x: 510, y: 375 },  // 41
  { x: 510, y: 440 },  // 42

  { x: 445, y: 440 },  // 43
  { x: 380, y: 440 },  // 44
  { x: 315, y: 440 },  // 45
  { x: 250, y: 440 },  // 46

  { x: 250, y: 375 },  // 47
  { x: 250, y: 310 },  // 48

  { x: 315, y: 310 },  // 49
  // meta
  { x: 380, y: 300, special: 'meta' }  // 50
];

// Generate the snake path cells
const snakePath = document.querySelector('.snake-path');
const cells = [];

// Create cells based on coordinates
pathCoordinates.forEach((coord, index) => {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  
  // Apply position and size
  cell.style.left = `${coord.x}px`;
  cell.style.top = `${coord.y}px`;
  
  // Special styling for start and meta
  if (coord.special === 'start') {
    cell.classList.add('start');
    cell.textContent = 'Start';
  } else if (coord.special === 'meta') {
    cell.classList.add('meta');
    cell.textContent = 'Meta';
  } else {
    cell.textContent = index;
  }
  
  snakePath.appendChild(cell);
  cells[index] = cell;
});

// Create connecting paths between cells
for (let i = 0; i < pathCoordinates.length - 1; i++) {
  const current = pathCoordinates[i];
  const next = pathCoordinates[i + 1];
  
  // Calculate distance and position for connector
  const dx = next.x - current.x;
  const dy = next.y - current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const connector = document.createElement('div');
  connector.classList.add('connector');
  
  // Determine if it's a horizontal, vertical, or curved connector
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connector
    connector.classList.add('horizontal');
    connector.style.width = `${distance}px`;
    connector.style.height = '10px';
    connector.style.left = `${current.x + 30}px`;
    connector.style.top = `${current.y + 25}px`;
    
    // Adjust rotation for direction
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    connector.style.transform = `rotate(${angle}deg)`;
    connector.style.transformOrigin = 'left center';
  } else {
    // Vertical connector
    connector.classList.add('vertical');
    connector.style.height = `${distance}px`;
    connector.style.width = '10px';
    connector.style.left = `${current.x + 25}px`;
    connector.style.top = `${current.y + 30}px`;
    
    // Adjust rotation for direction
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    connector.style.transform = `rotate(${angle}deg)`;
    connector.style.transformOrigin = 'center top';
  }
  
  snakePath.appendChild(connector);
}

// Update all pawns positions based on database data
async function initializePawns() {
  const pawns = document.querySelectorAll('.pawn');
  const players = await fetchPlayers();
  
  pawns.forEach((pawn) => {
    const playerId = pawn.getAttribute('data-player-id');
    const player = players.find(p => p.id == playerId);
    
    if (player) {
      // Calculate position based on player's result (1 point = 1 position)
      const position = Math.min(player.result, pathCoordinates.length - 1);
      pawn.setAttribute('data-position', position);
      updatePawnPosition(pawn, position);
    }
  });
}

// Dice roll logic
const dice = document.querySelector('.die-list');
const diceResult = document.getElementById('dice-result');

async function rollDiceForPlayer(playerId) {
  if (isRolling) return;
  
  isRolling = true;
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Update dice display
  dice.classList.toggle('odd-roll');
  dice.classList.toggle('even-roll');
  dice.dataset.roll = roll;
  
  try {
    // Send roll to server
    const response = await fetch(`/api/roll/${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roll })
    });
    
    const data = await response.json();
    const player = data.player;
    
    // Get pawn element
    const pawn = document.querySelector(`.pawn[data-player-id="${playerId}"]`);
    
    setTimeout(() => {
      diceResult.textContent = `Klasa ${player.name} wyrzuciła ${roll}`;
      
      // Calculate new position (1 point = 1 position)
      const newPosition = Math.min(player.result, pathCoordinates.length - 1);
      
      pawn.setAttribute('data-position', newPosition);
      updatePawnPosition(pawn, newPosition);
      
      // Check for win
      if (newPosition === pathCoordinates.length - 1) {
        setTimeout(() => {
          alert(`Klasa ${player.name} wygrywa! 🎉`);
        }, 500);
      }
      
      // Update score table
      fetchPlayers();
      
      isRolling = false;
    }, 1500);
  } catch (error) {
    console.error('Error rolling dice:', error);
    isRolling = false;
  }
}

// Update pawn position
function updatePawnPosition(pawn, position) {
  const cell = cells[position];
  const pawnsInCell = Array.from(document.querySelectorAll('.pawn')).filter(p => 
    parseInt(p.getAttribute('data-position')) === position
  );
  
  const offsetX = parseInt(cell.style.left);
  const offsetY = parseInt(cell.style.top);
  const cellWidth = 60;
  const cellHeight = 60;
  
  // Adjust for multiple pawns in the same cell
  const offset = 5;
  const pawnSize = Math.min(40, (cellWidth - (pawnsInCell.length - 1) * offset) / pawnsInCell.length);
  
  const index = pawnsInCell.indexOf(pawn);
  
  pawn.style.width = `${pawnSize}px`;
  pawn.style.height = `${pawnSize}px`;
  pawn.style.left = `${offsetX + cellWidth / 2 - pawnSize / 2 + 
    (index - (pawnsInCell.length - 1) / 2) * (pawnSize + offset)}px`;
  pawn.style.top = `${offsetY + cellHeight / 2 - pawnSize / 2}px`;
}

// Reset game
async function resetGame() {
  try {
    const response = await fetch('/reset', {
      method: 'POST'
    });
    
    if (response.ok) {
      const pawns = document.querySelectorAll('.pawn');
      pawns.forEach((pawn) => {
        pawn.setAttribute('data-position', 0);
        updatePawnPosition(pawn, 0);
        pawn.style.width = '40px';
        pawn.style.height = '40px';
      });
      
      diceResult.textContent = '';
      
      // Refresh player data
      fetchPlayers();
      
      isRolling = false;
      const dice = document.querySelector('.dice');
      dice.style.transform = 'rotateX(0) rotateY(0)';
    }
  } catch (error) {
    console.error('Error resetting game:', error);
  }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  // Fetch players and initialize pawns
  initializePawns();
  
  // Add event listeners to buttons
  document.querySelectorAll('.class-buttons button').forEach(button => {
    const playerId = button.getAttribute('data-player-id');
    button.addEventListener('click', () => rollDiceForPlayer(playerId));
  });
  
  // Reset game button
  document.getElementById('reset-game').addEventListener('click', resetGame);
});