import { config } from './config.js';

// Global players data
let players = [];

// Fetch players data from server
async function fetchPlayers() {
  try {
    const response = await fetch('/api/players');
    players = await response.json();
    return players;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

// Submit dice roll to server
async function submitRoll(playerId, roll) {
  try {
    const response = await fetch(`/api/roll/${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roll })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting roll:', error);
    throw error;
  }
}

// Reset game state on server
async function resetGame() {
  try {
    const response = await fetch('/reset', {
      method: 'POST'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error resetting game:', error);
    return false;
  }
}

// Fetch recent tasks from server
async function fetchRecentTasks() {
  try {
    const response = await fetch('/get_recent_tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    return { recent_tasks: [] };
  }
}

export { players, fetchPlayers, submitRoll, resetGame, fetchRecentTasks };
