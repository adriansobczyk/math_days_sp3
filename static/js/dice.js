import { config } from './config.js';
import { players, fetchPlayers, submitRoll } from './api.js';
import { updatePawnPosition, getPathLength, updateScoreTable } from './players.js';

const diceResult = document.getElementById('dice-result');

async function rollDiceForPlayer(playerId, rollValue = null) {
  if (config.isRolling) return;
  
  config.isRolling = true;
  const rollButton = document.getElementById(`roll-${playerId}`);
  rollButton.disabled = true;
  const playerIdNum = Number(playerId);
  const roll = rollValue !== null ? rollValue : Math.floor(Math.random() * 6) + 1;
  const dice = document.querySelector('.die-list');
  dice.classList.toggle('odd-roll');
  dice.classList.toggle('even-roll');
  dice.dataset.roll = roll;
  
  try {
    let data;
    if (rollValue !== null) {
      const localPlayer = players.find(p => p.id === playerIdNum);
      
      if (!localPlayer) {
        console.error('Player not found locally', { playerId, playerIdNum, players });
        throw new Error('Player not found');
      }
      
      data = { player: localPlayer, roll };
    } else {
      data = await submitRoll(playerIdNum, roll);
    }
    console.log('Roll data received:', data);
    if (!data || !data.player) {
      console.error('Invalid data received', data);
      throw new Error('No player data received');
    }
    const player = data.player;
    const pawn = document.querySelector(`.pawn[data-player-id="${playerIdNum}"]`);
    
    if (!pawn) {
      console.error('Pawn not found', { playerIdNum });
      throw new Error('Pawn not found');
    }
    
    setTimeout(() => {
      const playerName = player.name || `Player ${playerIdNum}`;
      diceResult.textContent = `Klasa ${playerName} wyrzuciła ${roll}`;
      diceResult.classList.remove('hidden');
      const newPosition = Math.min(player.result, getPathLength() - 1);
      pawn.setAttribute('data-position', newPosition);
      updatePawnPosition(pawn, newPosition);
      if (newPosition === getPathLength() - 1) {
        setTimeout(() => {
          alert(`Klasa ${playerName} wygrywa! 🎉`);
        }, 500);
      }
      fetchPlayers().then(() => {
        updateScoreTable();
      });
      
      config.isRolling = false;
      rollButton.disabled = false;
    }, 1500);
  } catch (error) {
    console.error('Error rolling dice:', error);
    config.isRolling = false;
    rollButton.disabled = false;
   
    diceResult.textContent = 'Wystąpił błąd podczas rzutu kostką';
    diceResult.classList.remove('hidden');
  }
}

function resetDice() {
  const dice = document.querySelector('.dice');
  dice.style.transform = 'rotateX(0) rotateY(0)';
  diceResult.textContent = '';
  diceResult.classList.add('hidden');
}

window.rollDiceForPlayer = rollDiceForPlayer;
window.resetDice = resetDice;

export { rollDiceForPlayer, resetDice };