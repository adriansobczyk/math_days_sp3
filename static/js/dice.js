import { config } from './config.js';
import { players, fetchPlayers, submitRoll } from './api.js';
import { updatePawnPosition, getPathLength, updateScoreTable } from './players.js';

const diceResult = document.getElementById('dice-result');

async function rollDiceForPlayer(playerId, rollValue = null) {
  if (config.isRolling) return;
  
  config.isRolling = true;
  const rollButton = document.getElementById(`roll-${playerId}`);
  rollButton.disabled = true; // Disable the button
  
  // Convert playerId to number to match the players array
  const playerIdNum = Number(playerId);
  
  // Use the passed rollValue or generate a new one
  const roll = rollValue !== null ? rollValue : Math.floor(Math.random() * 6) + 1;
  
  // Update dice display
  const dice = document.querySelector('.die-list');
  dice.classList.toggle('odd-roll');
  dice.classList.toggle('even-roll');
  dice.dataset.roll = roll;
  
  try {
    // If rollValue is not provided, submit the roll to the server
    let data;
    if (rollValue !== null) {
      // Find the player locally if roll value is provided
      const localPlayer = players.find(p => p.id === playerIdNum);
      
      if (!localPlayer) {
        console.error('Player not found locally', { playerId, playerIdNum, players });
        throw new Error('Player not found');
      }
      
      data = { player: localPlayer, roll };
    } else {
      // Submit roll to server if no roll value
      data = await submitRoll(playerIdNum, roll);
    }
    
    // Detailed logging
    console.log('Roll data received:', data);
    
    // Ensure player object exists
    if (!data || !data.player) {
      console.error('Invalid data received', data);
      throw new Error('No player data received');
    }
    
    const player = data.player;
    
    // Get pawn element
    const pawn = document.querySelector(`.pawn[data-player-id="${playerIdNum}"]`);
    
    if (!pawn) {
      console.error('Pawn not found', { playerIdNum });
      throw new Error('Pawn not found');
    }
    
    setTimeout(() => {
      // Ensure player name exists before using it
      const playerName = player.name || `Player ${playerIdNum}`;
      
      diceResult.textContent = `Klasa ${playerName} wyrzuciła ${roll}`;
      
      // Calculate new position (1 point = 1 position)
      const newPosition = Math.min(player.result, getPathLength() - 1);
      
      pawn.setAttribute('data-position', newPosition);
      updatePawnPosition(pawn, newPosition);
      
      // Check for win
      if (newPosition === getPathLength() - 1) {
        setTimeout(() => {
          alert(`Klasa ${playerName} wygrywa! 🎉`);
        }, 500);
      }
      
      // Update score table
      fetchPlayers().then(() => {
        updateScoreTable();
      });
      
      config.isRolling = false;
      rollButton.disabled = false; // Re-enable the button
    }, 1500);
  } catch (error) {
    console.error('Error rolling dice:', error);
    config.isRolling = false;
    rollButton.disabled = false; // Re-enable the button
    
    // Optional: Show user-friendly error message
    diceResult.textContent = 'Wystąpił błąd podczas rzutu kostką';
  }
}

// Reset dice display
function resetDice() {
  const dice = document.querySelector('.dice');
  dice.style.transform = 'rotateX(0) rotateY(0)';
  diceResult.textContent = '';
}

// Attach functions to the window object
window.rollDiceForPlayer = rollDiceForPlayer;
window.resetDice = resetDice;

export { rollDiceForPlayer, resetDice };