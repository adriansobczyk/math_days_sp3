import { pathCoordinates } from './config.js';
import { fetchPlayers } from './api.js';

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
      
      // Adjust rotation for direction
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      connector.style.transform = `rotate(${angle}deg)`;
      connector.style.transformOrigin = 'center top';
    }
    
    snakePath.appendChild(connector);
  }
}

// Get cell at position
function getCell(position) {
  return cells[position];
}

function enablePlayerButton() {
  const playerId = document.getElementById('player-select').value;
  const rollButton = document.getElementById(`roll-${playerId}`);
  rollButton.disabled = false;
}

function showBonusModal(playerId) {
  // Convert playerId to integer
  playerId = parseInt(playerId, 10);

  // Fetch the player object
  const player = players.find(p => p.id === playerId); // Assuming players is an array of player objects
  if (!player) {
    console.error(`Player with ID ${playerId} not found`);
    return;
  }

  const bonuses = player.bonus.split(','); // Assuming bonuses are stored as a comma-separated string
  const bonusList = document.getElementById('bonus-list');
  bonusList.innerHTML = '';
  bonuses.forEach(bonus => {
    const li = document.createElement('li');
    li.textContent = bonus.trim();
    bonusList.appendChild(li);
  });
  document.getElementById('bonusModal').style.display = 'block';
}

function closeBonusModal() {
  document.getElementById('bonusModal').style.display = 'none';
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
  const modal = document.getElementById('bonusModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// Fetch players data when the page loads
window.onload = function() {
  loadPlayers();
}

export { generateBoard, getCell, enablePlayerButton, showBonusModal, closeBonusModal };