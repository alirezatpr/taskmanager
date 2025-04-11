const API_URL = 'https://67f92412094de2fe6ea09953.mockapi.io/tasks';
let currentEditId = null;
let allTasks = [];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        allTasks = await response.json();
        renderTasks(allTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

document.getElementById('searchInput').addEventListener('input', filterTasks);
document.getElementById('statusFilter').addEventListener('change', filterTasks);

function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredTasks = allTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    renderTasks(filteredTasks);
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newTask = {
        title: document.getElementById('title').value.trim(),
        status: document.getElementById('status').value,
        priority: document.getElementById('priority').value,
        createdAt: new Date().toISOString()
    };

    if (!newTask.title) return;

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newTask)
        });
        fetchTasks();
        document.getElementById('taskForm').reset();
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function handleEditClick(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`);
        const task = await response.json();
        openEditModal(task);
    } catch (error) {
        console.error('Error fetching task:', error);
    }
}

function openEditModal(task) {
    currentEditId = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editStatus').value = task.status;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editModal').classList.remove('hidden');
}

async function updateTask() {
    if (!currentEditId) return;

    const updatedTask = {
        title: document.getElementById('editTitle').value.trim(),
        status: document.getElementById('editStatus').value,
        priority: document.getElementById('editPriority').value
    };

    if (!updatedTask.title) return;

    try {
        await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedTask)
        });
        closeModal();
        fetchTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
    currentEditId = null;
}

function renderTasks(tasks) {
    const containers = {
        'to do': document.getElementById('todo-tasks'),
        'inprogress': document.getElementById('inprogress-tasks'),
        'finished': document.getElementById('finished-tasks')
    };

    Object.values(containers).forEach(container => container.innerHTML = '');

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-white/20';
        taskElement.innerHTML = `
            <div class="flex justify-between items-start gap-3">
                <div class="flex-1">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${getStatusIcon(task.status)}</span>
                        <span class="font-semibold text-slate-700">${task.title}</span>
                    </div>
                    <div class="mt-3 flex flex-col gap-2">
                        <span class="text-sm ${getPriorityClass(task.priority)} px-3 py-1.5 rounded-full w-fit shadow-inner">
                            ${getPriorityIcon(task.priority)} ${task.priority}
                        </span>
                        <span class="text-xs text-slate-500 font-mono">
                            🕒 ${formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="handleEditClick('${task.id}')" class="text-indigo-500 hover:text-indigo-700 transition-colors p-2 rounded-lg hover:bg-indigo-50">✏️</button>
                    <button onclick="deleteTask('${task.id}')" class="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50">🗑️</button>
                </div>
            </div>
        `;
        containers[task.status].appendChild(taskElement);
    });
}

function getStatusIcon(status) {
    const icons = {
        'to do': '📋',
        'inprogress': '🚧',
        'finished': '✅'
    };
    return icons[status] || '📌';
}

function getPriorityIcon(priority) {
    const icons = {
        low: '⏳',
        medium: '⚠️',
        high: '🔥'
    };
    return icons[priority] || '🔹';
}

function getPriorityClass(priority) {
    const classes = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-slate-100 text-slate-800';
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

fetchTasks();