const API_URL = 'http://localhost:5000';

// DOM Elements
const authSection = document.getElementById('auth-section');
const itemsSection = document.getElementById('items-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const addItemForm = document.getElementById('add-item-form');
const itemsList = document.getElementById('items-list');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showItemsSection();
        loadItems();
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showItemsSection();
            loadItems();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            loginForm.reset();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showAuthSection();
});

// Add item form submission
addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemName = document.getElementById('item-name').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name: itemName }),
        });

        if (response.ok) {
            document.getElementById('item-name').value = '';
            loadItems();
        } else {
            alert('Failed to add item');
        }
    } catch (error) {
        console.error('Add item error:', error);
        alert('An error occurred while adding the item');
    }
});

// Load items
async function loadItems() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/items`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const items = await response.json();
            displayItems(items);
        } else {
            alert('Failed to load items');
        }
    } catch (error) {
        console.error('Load items error:', error);
        alert('An error occurred while loading items');
    }
}

// Display items
function displayItems(items) {
    itemsList.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'list-group-item';
        itemElement.innerHTML = `
            <span>${item.name}</span>
            <button class="btn btn-danger delete-btn" data-id="${item._id}">Delete</button>
        `;
        itemsList.appendChild(itemElement);

        // Add delete event listener
        const deleteBtn = itemElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/items/${item._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    loadItems();
                } else {
                    alert('Failed to delete item');
                }
            } catch (error) {
                console.error('Delete item error:', error);
                alert('An error occurred while deleting the item');
            }
        });
    });
}

// Show/hide sections
function showItemsSection() {
    authSection.classList.add('d-none');
    itemsSection.classList.remove('d-none');
}

function showAuthSection() {
    authSection.classList.remove('d-none');
    itemsSection.classList.add('d-none');
} 