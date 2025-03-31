// User Authentication and Tree Data System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize localStorage if empty
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('treeRecords')) {
        localStorage.setItem('treeRecords', JSON.stringify([]));
    }
    
    // Check if user is already logged in
    checkLoggedInUser();
    
    // Set up form event listeners
    setupForms();
    
    // Display user's tree data on dashboard
    displayTreeData();
});

function checkLoggedInUser() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser'));
    if (loggedInUser && window.location.pathname.includes('login.html')) {
        // Redirect to dashboard if user is already logged in
        window.location.href = 'dashboard.html';
    } else if (!loggedInUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
        // Redirect to login if not logged in and not on login/signup pages
        window.location.href = 'login.html';
    }
}

function setupForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
}

function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember')?.checked;
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters');
        return;
    }
    
    // Check user credentials
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showError('passwordError', 'Invalid email or password');
        return;
    }
    
    // Login successful
    if (rememberMe) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

function handleSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.some(u => u.email === email)) {
        showError('emailError', 'Email already registered');
        return;
    }
    
    // Create new user
    const newUser = {
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login the new user
    sessionStorage.setItem('loggedInUser', JSON.stringify(newUser));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

function displayTreeData() {
    if (window.location.pathname.includes('dashboard.html')) {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            const treeRecords = JSON.parse(localStorage.getItem('treeRecords') || '[]');
            const userTrees = treeRecords.filter(record => record.userEmail === loggedInUser.email);
            
            const treeList = document.getElementById('treeList');
            if (treeList) {
                if (userTrees.length === 0) {
                    treeList.innerHTML = '<p class="text-gray-500">No tree data recorded yet.</p>';
                } else {
                    treeList.innerHTML = userTrees.map(tree => `
                        <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                            <div class="px-4 py-5 sm:px-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">
                                    Tree ID: ${tree.treeId}
                                </h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                                    Last recorded: ${new Date(tree.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <dl class="sm:divide-y sm:divide-gray-200">
                                    <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt class="text-sm font-medium text-gray-500">Height</dt>
                                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${tree.height} meters</dd>
                                    </div>
                                    <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt class="text-sm font-medium text-gray-500">Tilt</dt>
                                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${tree.tilt}°</dd>
                                    </div>
                                    <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt class="text-sm font-medium text-gray-500">Canopy Area</dt>
                                        <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${tree.canopy} m²</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
    }
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}