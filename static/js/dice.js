import { config } from './config.js';
import { players, fetchPlayers, submitRoll } from './api.js';
import { updatePawnPosition, getPathLength, updateScoreTable } from './players.js';

const diceResult = document.getElementById('dice-result');

// Roll dice for a specific player
async function rollDiceForPlayer(playerId) {
  if (config.isRolling) return;
  
  config.isRolling = true;
  const rollButton = document.getElementById(`roll-${playerId}`);
  rollButton.disabled = true; // Disable the button
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Update dice display
  const dice = document.querySelector('.die-list');
  dice.classList.toggle('odd-roll');
  dice.classList.toggle('even-roll');
  dice.dataset.roll = roll;
  
  try {
    // Send roll to server
    const data = await submitRoll(playerId, roll);
    const player = data.player;
    
    // Get pawn element
    const pawn = document.querySelector(`.pawn[data-player-id="${playerId}"]`);
    
    setTimeout(() => {
      diceResult.textContent = `Klasa ${player.name} wyrzuciła ${roll}`;
      
      // Calculate new position (1 point = 1 position)
      const newPosition = Math.min(player.result, getPathLength() - 1);
      
      pawn.setAttribute('data-position', newPosition);
      updatePawnPosition(pawn, newPosition);
      
      // Check for win
      if (newPosition === getPathLength() - 1) {
        setTimeout(() => {
          alert(`Klasa ${player.name} wygrywa! 🎉`);
        }, 500);
      }
      
      // Update score table
      fetchPlayers().then(() => {
        updateScoreTable();
      });
      
      config.isRolling = false;
    }, 1500);
  } catch (error) {
    console.error('Error rolling dice:', error);
    config.isRolling = false;
    rollButton.disabled = false; // Re-enable the button
  }
}

// Reset dice display
function resetDice() {
  const dice = document.querySelector('.dice');
  dice.style.transform = 'rotateX(0) rotateY(0)';
  diceResult.textContent = '';
}

export { rollDiceForPlayer, resetDice };