import { generateBoard } from './board.js';
import { initializePawns, resetPawns, updateScoreTable } from './players.js';
import { rollDiceForPlayer, resetDice } from './dice.js';
import { resetGame, fetchPlayers } from './api.js';
import { pollRecentTasks, pollBonusUpdates } from './notification.js';

// Initialize the game
function initializeGame() {
  // Generate the game board
  generateBoard();
  
  // Fetch players and initialize pawns
  initializePawns();
  
  // Poll for task notifications and bonus updates
  setInterval(pollRecentTasks, 5000);
  setInterval(pollBonusUpdates, 5000);
  
  // Periodically update the UI with latest player data
  setInterval(updateScoreTable, 3000);
  
  // Add event listeners to buttons
  addEventListeners();
}

// Add event listeners
function addEventListeners() {
  // Add event listeners to class buttons
  document.querySelectorAll('.class-buttons button').forEach(button => {
    const playerId = button.getAttribute('data-player-id');
    button.addEventListener('click', () => rollDiceForPlayer(playerId));
  });
  
  // Reset game button
  document.getElementById('reset-game').addEventListener('click', handleResetGame);
}

// Handle reset game
async function handleResetGame() {
  const success = await resetGame();
  
  if (success) {
    resetPawns();
    resetDice();
    await initializePawns();
    await resetBonuses();
  }
}

// Reset bonuses for all players
async function resetBonuses() {
  const players = await fetchPlayers();
  players.forEach(player => {
    document.getElementById(`bonus-plus-one-${player.id}`).checked = player.bonus_plus_one;
    document.getElementById(`bonus-plus-two-${player.id}`).checked = player.bonus_plus_two;
    document.getElementById(`bonus-plus-three-${player.id}`).checked = player.bonus_plus_three;
  });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeGame);

export { initializeGame };