import { updateBonus } from './api.js';

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

function updateBonusCheckboxes(playerId, bonuses) {
  const bonusPlusOneCheckbox = document.getElementById(`bonus_plus_one_${playerId}`);
  const bonusPlusTwoCheckbox = document.getElementById(`bonus_plus_two_${playerId}`);
  const bonusPlusThreeCheckbox = document.getElementById(`bonus_plus_three_${playerId}`);

  if (bonusPlusOneCheckbox) {
    bonusPlusOneCheckbox.checked = bonuses.bonus_plus_one;
  }
  if (bonusPlusTwoCheckbox) {
    bonusPlusTwoCheckbox.checked = bonuses.bonus_plus_two;
  }
  if (bonusPlusThreeCheckbox) {
    bonusPlusThreeCheckbox.checked = bonuses.bonus_plus_three;
  }
}

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

// Poll for recent tasks every 3 seconds
async function pollRecentTasks() {
  try {
    const response = await fetch('/get_recent_tasks');
    const data = await response.json();
    updateTaskNotifications(data.recent_tasks);
  } catch (error) {
    console.error('Error polling recent tasks:', error);
  }
}

// Poll for bonus updates every 3 seconds
async function pollBonusUpdates() {
  try {
    const response = await fetch('/api/bonus_updates');
    const data = await response.json();
    data.forEach(update => {
      updateBonusCheckboxes(update.player_id, update.bonuses);
    });
  } catch (error) {
    console.error('Error polling bonus updates:', error);
  }
}

// Call poll functions every 3 seconds
setInterval(pollRecentTasks, 3000);
setInterval(pollBonusUpdates, 3000);

// Attach event listeners to bonus checkboxes
setupBonusCheckboxes();

export { updateTaskNotifications, updateBonusCheckboxes, pollBonusUpdates, pollRecentTasks };