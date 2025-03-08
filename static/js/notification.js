import { updateBonus } from './api.js';

let displayedNotifications = new Set();

function updateTaskNotifications(tasks) {
  const taskNotifications = document.getElementById('task-notifications');
  
  tasks.forEach(task => {
    const taskKey = `${task.type}-${task.player.name}-${task.task_name}-${task.timestamp}`;
    
    if (!displayedNotifications.has(taskKey)) {
      const taskAlert = document.createElement('div');
      taskAlert.className = 'task-completion-alert';
      
      if (task.type === 'task') {
        taskAlert.textContent = `Klasa ${task.player.name} ukończyła ${task.task_name}`;
      } else if (task.type === 'code') {
        taskAlert.textContent = `Klasa ${task.task_name}`;
      }
      
      taskNotifications.appendChild(taskAlert);
      displayedNotifications.add(taskKey);

      // Set a timeout to remove the notification after 10 seconds
      setTimeout(() => {
        taskAlert.remove();
        displayedNotifications.delete(taskKey);
      }, 10000); // 10000 milliseconds = 10 seconds
    }
  });
}

function updateBonusCheckboxes(playerId, bonuses) {
  const bonusPlusOneCheckbox = document.getElementById(`bonus-plus-one-${playerId}`);
  const bonusPlusTwoCheckbox = document.getElementById(`bonus-plus-two-${playerId}`);
  const bonusPlusThreeCheckbox = document.getElementById(`bonus-plus-three-${playerId}`);

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

// Poll for recent tasks
async function pollRecentTasks() {
  try {
    const response = await fetch('/get_recent_tasks');
    const data = await response.json();
    updateTaskNotifications(data.recent_tasks);
  } catch (error) {
    console.error('Error polling recent tasks:', error);
  }
}

// Poll for bonus updates
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

// Attach event listeners to bonus checkboxes
setupBonusCheckboxes();

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

document.getElementById('show-notifications').addEventListener('click', () => {
  const modal = document.getElementById('notificationsModal');
  modal.style.display = 'block';
  fetch('/api/notifications')
    .then(response => response.json())
    .then(data => {
      const notificationsList = document.getElementById('notifications-list');
      notificationsList.innerHTML = '';
      data.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.textContent = `${formatDate(notification.timestamp)}: ${notification.message}`;
        notificationsList.appendChild(notificationItem);
      });
    });
});

document.querySelector('#notificationsModal .close').addEventListener('click', () => {
  document.getElementById('notificationsModal').style.display = 'none';
});

window.onclick = function(event) {
  const modal = document.getElementById('notificationsModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

export { updateTaskNotifications, updateBonusCheckboxes, pollBonusUpdates, pollRecentTasks };