// Use the global io variable provided by the socket.io.js script
const socket = io();

// Update task notifications
function updateTaskNotifications(tasks) {
  const taskNotifications = document.getElementById('task-notifications');
  taskNotifications.innerHTML = '';
  
  tasks.forEach(task => {
    const taskAlert = document.createElement('div');
    taskAlert.className = 'task-alert';
    
    if (task.type === 'task') {
      taskAlert.textContent = `Klasa ${task.player.name} ukończyła ${task.task_name}`;
    } else if (task.type === 'code') {
      taskAlert.textContent = `Player ${task.player.name} ${task.task_name}`;
    }
    
    taskNotifications.appendChild(taskAlert);
  });
}

// Setup notifications
function setupNotifications() {
  // Listen for new tasks from the server
  socket.on('new_task', (tasks) => {
    updateTaskNotifications(tasks);
  });
}

export { updateTaskNotifications, setupNotifications };