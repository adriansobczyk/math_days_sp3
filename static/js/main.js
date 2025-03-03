import { generateBoard } from './board.js';
import { initializePawns, resetPawns } from './players.js';
import { rollDiceForPlayer, resetDice } from './dice.js';
import { resetGame } from './api.js';
import { setupNotifications } from './notification.js';

// Initialize the game
function initializeGame() {
  // Generate the game board
  generateBoard();
  
  // Fetch players and initialize pawns
  initializePawns();
  
  // Setup task notifications
  setupNotifications();
  
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
    initializePawns();
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeGame);

export { initializeGame };