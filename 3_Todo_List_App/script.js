document.addEventListener('DOMContentLoaded', function () {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stats = document.getElementById('stats');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Render todos
    function renderTodos() {
        // Filter todos based on current filter
        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        // Clear the list
        todoList.innerHTML = '';

        // Show empty state if no todos
        if (filteredTodos.length === 0) {
            const emptyStateClone = emptyState.cloneNode(true);
            todoList.appendChild(emptyStateClone);
        } else {
            // Add todos to the list
            filteredTodos.forEach((todo, index) => {
                const todoItem = document.createElement('li');
                todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                todoItem.dataset.id = todo.id;

                todoItem.innerHTML = `
                            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                            <span class="todo-text">${todo.text}</span>
                            <div class="todo-actions">
                                <button class="edit-btn">✏️</button>
                                <button class="delete-btn">🗑️</button>
                            </div>
                        `;

                todoList.appendChild(todoItem);
            });
        }

        // Update stats
        updateStats();
    }

    // Update stats
    function updateStats() {
        const totalTodos = todos.length;
        const completedTodos = todos.filter(todo => todo.completed).length;
        const remainingTodos = totalTodos - completedTodos;

        stats.textContent = `${remainingTodos} ${remainingTodos === 1 ? 'task' : 'tasks'} remaining`;
    }

    // Add todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };

            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
            todoInput.focus();
        }
    }

    // Toggle todo completion
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    // Edit todo
    function editTodo(id, newText) {
        if (newText.trim()) {
            todos = todos.map(todo => {
                if (todo.id === id) {
                    return { ...todo, text: newText.trim() };
                }
                return todo;
            });
            saveTodos();
            renderTodos();
        }
    }

    // Delete todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Set filter
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        renderTodos();
    }

    // Event listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    todoList.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;

        const id = parseInt(todoItem.dataset.id);

        if (e.target.classList.contains('todo-checkbox')) {
            toggleTodo(id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTodo(id);
        } else if (e.target.classList.contains('edit-btn')) {
            const todoText = todoItem.querySelector('.todo-text');
            const currentText = todoText.textContent;
            const newText = prompt('Edit your task:', currentText);
            if (newText !== null) {
                editTodo(id, newText);
            }
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Initial render
    renderTodos();
});
