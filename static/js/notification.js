import { updateBonus } from './api.js';

// Use the global io variable provided by the socket.io.js script
const socket = io();

// Update task notifications
function updateTaskNotifications(tasks) {
  const taskNotifications = document.getElementById('task-notifications');
  taskNotifications.innerHTML = '';
  
  tasks.forEach(task => {
    const taskAlert = document.createElement('div');
    taskAlert.className = 'task-completion-alert';
    
    if (task.type === 'task') {
      taskAlert.textContent = `Klasa ${task.player.name} ukończyła ${task.task_name}`;
    } else if (task.type === 'code') {
      taskAlert.textContent = `Klasa ${task.task_name}`;
    }
    
    taskNotifications.appendChild(taskAlert);
  });
}

// Update bonus checkboxes for a player
function updateBonusCheckboxes(playerId, bonuses) {
  const playerRow = document.querySelector(`tr[data-player-id="${playerId}"]`);
  if (playerRow) {
    const bonusPlusOne = playerRow.querySelector(`#bonus-plus-one-${playerId}`);
    const bonusPlusTwo = playerRow.querySelector(`#bonus-plus-two-${playerId}`);
    const bonusPlusThree = playerRow.querySelector(`#bonus-plus-three-${playerId}`);

    if (bonusPlusOne) bonusPlusOne.checked = bonuses.bonus_plus_one;
    if (bonusPlusTwo) bonusPlusTwo.checked = bonuses.bonus_plus_two;
    if (bonusPlusThree) bonusPlusThree.checked = bonuses.bonus_plus_three;
  }
}

// Attach event listeners to bonus checkboxes
function setupBonusCheckboxes() {
  document.querySelectorAll('.bonus-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const playerId = event.target.dataset.playerId;
      const bonusType = event.target.id.split('-')[2];
      const isChecked = event.target.checked;

      // Call the updateBonus function from api.js
      updateBonus(playerId, bonusType, isChecked)
        .then(data => console.log('Bonus updated:', data))
        .catch(error => console.error('Error updating bonus:', error));
    });
  });
}

// Setup notifications and bonus updates
function setupNotifications() {
  // Listen for new tasks from the server
  socket.on('new_task', (tasks) => {
    updateTaskNotifications(tasks);
  });

  // Listen for bonus updates from the server
  socket.on('bonus_update', (data) => {
    updateBonusCheckboxes(data.player_id, data.bonuses);
  });

  // Attach event listeners to bonus checkboxes
  setupBonusCheckboxes();
}

export { updateTaskNotifications, setupNotifications };