import { pathCoordinates } from './config.js';
import { fetchPlayers } from './api.js';
import { getPathLength, updatePawnPosition, updateScoreTable } from './players.js';

let cells = [];
let players = [];

async function loadPlayers() {
  players = await fetchPlayers();
}
function generateBoard() {
  const snakePath = document.querySelector('.snake-path');
  snakePath.innerHTML = '';
  cells = [];
  pathCoordinates.forEach((coord, index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.left = `${coord.x}px`;
    cell.style.top = `${coord.y}px`;
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

  generateConnectors(snakePath);
  console.log('Plansza została wygenerowana.');
}
function generateConnectors(snakePath) {
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const current = pathCoordinates[i];
    const next = pathCoordinates[i + 1];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const connector = document.createElement('div');
    connector.classList.add('connector');
    if (Math.abs(dx) > Math.abs(dy)) {
      connector.classList.add('horizontal');
      connector.style.width = `${distance}px`;
      connector.style.height = '10px';
      connector.style.left = `${current.x + 30}px`;
      connector.style.top = `${current.y + 25}px`;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      connector.style.transform = `rotate(${angle}deg)`;
      connector.style.transformOrigin = 'left center';
    } else {
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
    const updatedPlayer = result.player;
    const playerIndex = players.findIndex(p => p.id === updatedPlayer.id);
    if (playerIndex !== -1) {
      players[playerIndex] = updatedPlayer;
    }
    const newPosition = Math.min(updatedPlayer.result, getPathLength() - 1);
    const pawn = document.querySelector(`.pawn[data-player-id="${playerId}"]`);
    updatePawnPosition(pawn, newPosition);
    updateScoreTable();

    const playerResultCell = document.querySelector(`tr[data-player-id="${playerId}"] .player-result`);
    if (playerResultCell) {
      playerResultCell.textContent = updatedPlayer.result;
    }

  } catch (error) {
    console.error('Error activating bonus:', error);
  }
}

window.onload = function() {
  loadPlayers();
}

window.enablePlayerButton = enablePlayerButton;
window.activateBonus = activateBonus;

export { generateBoard, getCell, enablePlayerButton, activateBonus};