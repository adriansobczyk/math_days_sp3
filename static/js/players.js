import { players, fetchPlayers } from './api.js';
import { getMathShape } from './config.js';
import { getCell } from './board.js';

// Update score table and button states
async function updateScoreTable() {
  const updatedPlayers = await fetchPlayers();
  
  updatedPlayers.forEach(player => {
    // Update result cell
    const row = document.querySelector(`#score-table tr[data-player-id="${player.id}"]`);
    if (row) {
      row.querySelector('.player-result').textContent = player.result;
      
      // Update roll button state
      const rollButton = document.getElementById(`roll-${player.id}`);
      if (rollButton) {
        rollButton.disabled = player.roll_disabled;
      }
      
      // Update unblock button state
      const unblockButton = row.querySelector('.unblock-button');
      if (unblockButton) {
        unblockButton.disabled = !player.task_done;
      }
      
      // Update bonus checkboxes
      const bonusOneCheck = document.getElementById(`bonus-plus-one-${player.id}`);
      const bonusTwoCheck = document.getElementById(`bonus-plus-two-${player.id}`);
      const bonusThreeCheck = document.getElementById(`bonus-plus-three-${player.id}`);
      
      if (bonusOneCheck) bonusOneCheck.checked = player.bonus_plus_one;
      if (bonusTwoCheck) bonusTwoCheck.checked = player.bonus_plus_two;
      if (bonusThreeCheck) bonusThreeCheck.checked = player.bonus_plus_three;
      
      // Update bonus activation buttons
      const bonusOneButton = document.getElementById(`bonus-one-${player.id}`);
      const bonusTwoButton = document.getElementById(`bonus-two-${player.id}`);
      const bonusThreeButton = document.getElementById(`bonus-three-${player.id}`);
      
      if (bonusOneButton) bonusOneButton.disabled = player.roll_disabled || !player.bonus_plus_one;
      if (bonusTwoButton) bonusTwoButton.disabled = player.roll_disabled || !player.bonus_plus_two;
      if (bonusThreeButton) bonusThreeButton.disabled = player.roll_disabled || !player.bonus_plus_three;
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

// Update all pawns positions based on database data
async function initializePawns() {
  const currentPlayers = await fetchPlayers();
  await updateScoreTable();
  renderPawns();
  
  const pawns = document.querySelectorAll('.pawn');
  
  pawns.forEach((pawn) => {
    const playerId = pawn.getAttribute('data-player-id');
    const player = currentPlayers.find(p => p.id == playerId);
    
    if (player) {
      // Calculate position based on player's result (1 point = 1 position)
      const position = Math.min(player.result, getPathLength() - 1);
      pawn.setAttribute('data-position', position);
      updatePawnPosition(pawn, position);
    }
  });
}

// Update pawn position
// Update pawn position
function updatePawnPosition(pawn, position) {
  const cell = getCell(position);
  if (!cell) return;
  
  const pawnsInCell = Array.from(document.querySelectorAll('.pawn')).filter(p =>
    parseInt(p.getAttribute('data-position')) === position
  );
  
  const offsetX = parseInt(cell.style.left);
  const offsetY = parseInt(cell.style.top);
  const cellWidth = 60;
  const cellHeight = 60;
  
  // Max pawns per row
  const maxPawnsPerRow = 5;
  
  // Adjust for multiple pawns in the same cell
  const offset = 2;
  // Calculate row and column based on index
  const index = pawnsInCell.indexOf(pawn);
  const row = Math.floor(index / maxPawnsPerRow);
  const col = index % maxPawnsPerRow;
  
  // Added minimum size of 15px
  const pawnSize = Math.max(15, Math.min(30, (cellWidth - (Math.min(maxPawnsPerRow, pawnsInCell.length) - 1) * offset) / Math.min(maxPawnsPerRow, pawnsInCell.length)));
  
  pawn.style.width = `${pawnSize}px`;
  pawn.style.height = `${pawnSize}px`;
  
  // Position each pawn in a grid pattern
  pawn.style.left = `${offsetX + (col * (pawnSize + offset))}px`;
  pawn.style.top = `${offsetY + (row * (pawnSize + offset))}px`;
}

// Get the total length of the path
function getPathLength() {
  return 51; // Based on pathCoordinates length
}

// Reset all pawns to starting position
function resetPawns() {
  const pawns = document.querySelectorAll('.pawn');
  pawns.forEach((pawn) => {
    pawn.setAttribute('data-position', 0);
    updatePawnPosition(pawn, 0);
    pawn.style.width = '40px';
    pawn.style.height = '40px';
  });
}

export {
  updateScoreTable,
  renderPawns,
  initializePawns,
  updatePawnPosition,
  getPathLength,
  resetPawns
};