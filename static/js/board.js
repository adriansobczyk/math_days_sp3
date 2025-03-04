import { pathCoordinates } from './config.js';
import { fetchPlayers } from './api.js';
import { getPathLength, updatePawnPosition, updateScoreTable } from './players.js';

// Store cells for later reference
let cells = [];
let players = [];

// Fetch players data from the server
async function loadPlayers() {
  players = await fetchPlayers();
}

// Generate the snake path cells
function generateBoard() {
  const snakePath = document.querySelector('.snake-path');
  snakePath.innerHTML = '';
  cells = [];

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
  generateConnectors(snakePath);
  console.log('Plansza została wygenerowana.');
}

// Generate connectors between cells
function generateConnectors(snakePath) {
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
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      connector.style.transform = `rotate(${angle}deg)`;
      connector.style.transformOrigin = 'center top';
    }
    
    snakePath.appendChild(connector);
  }
}

function getCell(position) {
  return cells[position];
}

function enablePlayerButton(playerId) {
  const rollButton = document.getElementById(`roll-${playerId}`);
  rollButton.disabled = false;
  console.log(`Klasa ${playerId} może teraz rzucić kostką.`);
}

async function activateBonus(playerId, bonusType) {
  try {
    const response = await fetch(`/api/activate_bonus/${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bonusType })
    });

    if (!response.ok) {
      throw new Error('Failed to activate bonus');
    }

    const result = await response.json();
    console.log(`Bonus activated: ${result.message}`);

    // Trigger dice roll animation and pawn movement
    if (bonusType === 'bonus_plus_three') {
      const player = result.player;
      const newPosition = Math.min(player.result, getPathLength() - 1);
      const pawn = document.querySelector(`.pawn[data-player-id="${playerId}"]`);
      updatePawnPosition(pawn, newPosition);
      updateScoreTable();
    } else {
      const player = result.player;
      const newPosition = Math.min(player.result, getPathLength() - 1);
      const pawn = document.querySelector(`.pawn[data-player-id="${playerId}"]`);
      updatePawnPosition(pawn, newPosition);
      updateScoreTable();
    }
  } catch (error) {
    console.error('Error activating bonus:', error);
  }
}


window.onload = function() {
  loadPlayers();
}

// Attach functions to the window object
window.enablePlayerButton = enablePlayerButton;
window.activateBonus = activateBonus;

export { generateBoard, getCell, enablePlayerButton, activateBonus};