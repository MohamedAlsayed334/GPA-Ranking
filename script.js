// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWv1cyxp2jL1YYc2Mw2BWT99p6CXTord8",
    authDomain: "gpa-rank.firebaseapp.com",
    projectId: "gpa-rank",
    storageBucket: "gpa-rank.firebasestorage.app",
    messagingSenderId: "567882895187",
    appId: "1:567882895187:web:590e9856d9a1458895dba6",
    measurementId: "G-CJY49VCZ13"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const gpaForm = document.getElementById('gpaForm');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const userIdSpan = document.getElementById('userId');
const userRankSpan = document.getElementById('userRank');
const totalStudentsSpan = document.getElementById('totalStudents');
const rankExplanationSpan = document.getElementById('rankExplanation');
const leaderboardBody = document.getElementById('leaderboardBody');
const leaderboardTable = document.getElementById('leaderboardTable');
const authLoading = document.getElementById('authLoading');
const leaderboardLoading = document.getElementById('leaderboardLoading');
const themeToggle = document.getElementById('themeToggle');
const viewAccountBtn = document.getElementById('viewAccountBtn');
const accountModal = document.getElementById('accountModal');
const closeModal = document.getElementById('closeModal');

// Password toggle elements
const loginPasswordToggle = document.getElementById('loginPasswordToggle');
const registerPasswordToggle = document.getElementById('registerPasswordToggle');
const loginPasswordInput = document.getElementById('loginPassword');
const registerPasswordInput = document.getElementById('registerPassword');

// Modal elements
const modalName = document.getElementById('modalName');
const modalId = document.getElementById('modalId');
const modalEmail = document.getElementById('modalEmail');
const modalGpa = document.getElementById('modalGpa');
const modalRank = document.getElementById('modalRank');

// Error/Success message elements
const loginError = document.getElementById('loginError');
const loginSuccess = document.getElementById('loginSuccess');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');
const gpaError = document.getElementById('gpaError');
const gpaSuccess = document.getElementById('gpaSuccess');

// Form containers for switching
const loginContainer = authSection.querySelector('.form-container');
const registerContainer = authSection.querySelectorAll('.form-container')[1];

// Current user data
let currentUser = null;
let allUsers = [];

// Initialize the app
function initApp() {
    // Set dark mode by default
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';

    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            loadUserData();
        } else {
            // User is signed out
            showAuthSection();
        }
    });

    // Set up theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // Set up account modal
    viewAccountBtn.addEventListener('click', showAccountModal);
    closeModal.addEventListener('click', hideAccountModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === accountModal) {
            hideAccountModal();
        }
    });

    // Set up password visibility toggles
    setupPasswordToggles();
}

// Set up password visibility toggles
function setupPasswordToggles() {
    // Login password toggle
    loginPasswordToggle.addEventListener('click', () => {
        togglePasswordVisibility(loginPasswordInput, loginPasswordToggle);
    });

    // Register password toggle
    registerPasswordToggle.addEventListener('click', () => {
        togglePasswordVisibility(registerPasswordInput, registerPasswordToggle);
    });
}

// Toggle password visibility
function togglePasswordVisibility(input, toggle) {
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Show account modal
function showAccountModal() {
    if (!currentUser || !currentUser.data) return;

    modalName.textContent = currentUser.data.name;
    modalId.textContent = currentUser.data.studentId;
    modalEmail.textContent = currentUser.data.email;
    modalGpa.textContent = currentUser.data.gpa.toFixed(2);

    // Find user's rank
    const userIndex = allUsers.findIndex(user => user.id === currentUser.uid);
    if (userIndex !== -1) {
        const userData = allUsers[userIndex];
        modalRank.textContent = `#${userData.rank} out of ${allUsers.length} students`;
    }

    accountModal.style.display = 'flex';
}

// Hide account modal
function hideAccountModal() {
    accountModal.style.display = 'none';
}

// Show register form
showRegister.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
    hideMessages();
});

// Show login form
showLogin.addEventListener('click', () => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
    hideMessages();
});

// Hide all messages
function hideMessages() {
    loginError.style.display = 'none';
    loginSuccess.style.display = 'none';
    registerError.style.display = 'none';
    registerSuccess.style.display = 'none';
    gpaError.style.display = 'none';
    gpaSuccess.style.display = 'none';
}

// Show loading state
function showLoading(show) {
    authLoading.style.display = show ? 'block' : 'none';
    if (show) {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'none';
    } else {
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
    }
}

// Validate student ID format (8 digits)
function validateStudentId(studentId) {
    const idRegex = /^\d{8}$/;
    return idRegex.test(studentId);
}

// Check if account already exists
async function checkAccountExists(studentId) {
    try {
        const email = `${studentId}@gmail.com`;

        // Check if user exists in Firebase Auth
        const methods = await auth.fetchSignInMethodsForEmail(email);
        return methods.length > 0;
    } catch (error) {
        console.error("Error checking account existence:", error);
        return false;
    }
}

// Display error message with professional styling
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';

    // Auto-hide error after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Display success message
function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';

    // Auto-hide success after 3 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentId = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;

    // Validate student ID
    if (!validateStudentId(studentId)) {
        showError(loginError, 'Student ID must be exactly 8 digits');
        return;
    }

    const email = `${studentId}@gmail.com`;

    hideMessages();
    showLoading(true);

    try {
        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        // Load user data from Firestore
        await loadUserData();

    } catch (error) {
        showLoading(false);

        // Handle specific error cases
        switch (error.code) {
            case 'auth/user-not-found':
                showError(loginError, 'No account found with this Student ID');
                break;
            case 'auth/wrong-password':
                showError(loginError, 'Incorrect password. Please try again.');
                break;
            case 'auth/too-many-requests':
                showError(loginError, 'Too many failed attempts. Please try again later.');
                break;
            default:
                showError(loginError, 'Login failed. Please check your credentials and try again.');
        }
    }
});

// Register form handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const studentId = document.getElementById('registerId').value;
    const password = document.getElementById('registerPassword').value;
    const gpa = parseFloat(document.getElementById('registerGPA').value);

    // Validate student ID
    if (!validateStudentId(studentId)) {
        showError(registerError, 'Student ID must be exactly 8 digits');
        return;
    }

    // Validate GPA
    if (gpa < 0 || gpa > 4.0 || isNaN(gpa)) {
        showError(registerError, 'Please enter a valid GPA between 0.0 and 4.0');
        return;
    }

    const email = `${studentId}@gmail.com`;

    hideMessages();
    showLoading(true);

    try {
        // Check if account already exists
        const accountExists = await checkAccountExists(studentId);
        if (accountExists) {
            showLoading(false);
            showError(registerError, 'An account with this Student ID already exists. Please login instead.');
            return;
        }

        // Create user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        // Create user document in Firestore
        await db.collection('users').doc(currentUser.uid).set({
            name: name,
            studentId: studentId,
            email: email,
            gpa: gpa,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Show success message
        showSuccess(registerSuccess, 'Account created successfully! Redirecting...');

        // Load user data
        await loadUserData();

    } catch (error) {
        showLoading(false);

        // Handle specific error cases
        switch (error.code) {
            case 'auth/email-already-in-use':
                showError(registerError, 'An account with this Student ID already exists. Please login instead.');
                break;
            case 'auth/weak-password':
                showError(registerError, 'Password is too weak. Please use at least 6 characters.');
                break;
            case 'auth/operation-not-allowed':
                showError(registerError, 'Account creation is temporarily disabled. Please try again later.');
                break;
            default:
                showError(registerError, 'Account creation failed. Please try again.');
        }
    }
});

// GPA form handler
gpaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const gpa = parseFloat(document.getElementById('gpaInput').value);

    if (gpa < 0 || gpa > 4.0 || isNaN(gpa)) {
        showError(gpaError, 'Please enter a valid GPA between 0.0 and 4.0');
        return;
    }

    hideMessages();

    try {
        // Update user's GPA in Firestore
        await db.collection('users').doc(currentUser.uid).update({
            gpa: gpa,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showSuccess(gpaSuccess, 'GPA updated successfully!');

        // Refresh user data and leaderboard
        await loadUserData();

    } catch (error) {
        showError(gpaError, 'Failed to update GPA. Please try again.');
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Load user data from Firestore
async function loadUserData() {
    try {
        // Get user document from Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            currentUser.data = userData;

            // Load all users for ranking
            await loadAllUsers();

            // Show dashboard
            showDashboard();
        } else {
            // User document doesn't exist (shouldn't happen)
            throw new Error('User data not found');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showError(loginError, 'Error loading user data. Please try logging in again.');
        auth.signOut();
    }
}

// Load all users for ranking
async function loadAllUsers() {
    leaderboardLoading.style.display = 'block';
    leaderboardTable.style.display = 'none';

    try {
        // Get all users from Firestore, ordered by GPA
        const snapshot = await db.collection('users')
            .orderBy('gpa', 'desc')
            .get();

        allUsers = [];
        snapshot.forEach(doc => {
            const userData = doc.data();
            allUsers.push({
                id: doc.id,
                ...userData
            });
        });

        // Calculate ranks with same GPA handling
        calculateRanks();

        // Update UI
        updateDashboard();

    } catch (error) {
        console.error('Error loading users:', error);
        showError(gpaError, 'Error loading leaderboard data.');
    } finally {
        leaderboardLoading.style.display = 'none';
        leaderboardTable.style.display = 'table';
    }
}

// Calculate ranks with proper same GPA handling
function calculateRanks() {
    if (allUsers.length === 0) return;

    // Sort by GPA descending, then by name ascending for same GPAs
    allUsers.sort((a, b) => {
        if (b.gpa !== a.gpa) {
            return b.gpa - a.gpa; // Higher GPA first
        }
        return a.name.localeCompare(b.name); // Alphabetical order for same GPA
    });

    // Assign ranks with same GPA handling
    let currentRank = 1;
    let previousGpa = allUsers[0].gpa;
    let sameGpaCount = 0;

    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].gpa < previousGpa) {
            currentRank += sameGpaCount;
            sameGpaCount = 1;
            previousGpa = allUsers[i].gpa;
        } else {
            sameGpaCount++;
        }

        allUsers[i].rank = currentRank;
    }
}

// Show dashboard
function showDashboard() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    updateDashboard();
}

// Show auth section
function showAuthSection() {
    dashboard.style.display = 'none';
    authSection.style.display = 'block';
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';

    // Clear forms
    loginForm.reset();
    registerForm.reset();
    hideMessages();
    showLoading(false);

    // Reset password toggles
    loginPasswordInput.type = 'password';
    loginPasswordToggle.innerHTML = '<i class="fas fa-eye"></i>';
    registerPasswordInput.type = 'password';
    registerPasswordToggle.innerHTML = '<i class="fas fa-eye"></i>';
}

// Update dashboard with current user data
function updateDashboard() {
    if (!currentUser || !currentUser.data) return;

    userNameSpan.textContent = currentUser.data.name;
    userIdSpan.textContent = currentUser.data.studentId;
    document.getElementById('gpaInput').value = currentUser.data.gpa;

    // Find user's rank
    const userIndex = allUsers.findIndex(user => user.id === currentUser.uid);
    if (userIndex !== -1) {
        const userData = allUsers[userIndex];
        userRankSpan.textContent = `#${userData.rank}`;
        totalStudentsSpan.textContent = allUsers.length;

        // Show rank explanation for same GPA cases
        const sameGpaUsers = allUsers.filter(user =>
            user.gpa === userData.gpa && user.id !== currentUser.uid
        );

        if (sameGpaUsers.length > 0) {
            rankExplanationSpan.textContent =
                `${sameGpaUsers.length + 1} students have the same GPA of ${userData.gpa.toFixed(2)}`;
        } else {
            rankExplanationSpan.textContent = '';
        }
    }

    updateLeaderboard();
}

// Update leaderboard
function updateLeaderboard() {
    // Clear current leaderboard
    leaderboardBody.innerHTML = '';

    // Get top 10 users
    const topUsers = allUsers.slice(0, 10);

    // Add rows to leaderboard
    topUsers.forEach((user, index) => {
        const row = document.createElement('tr');

        if (currentUser && user.id === currentUser.uid) {
            row.classList.add('current-user');
        }

        row.innerHTML = `
            <td>${user.rank}</td>
            <td>${user.name}</td>
            <td>${user.studentId}</td>
            <td>${user.gpa.toFixed(2)}</td>
        `;

        leaderboardBody.appendChild(row);
    });
}

// Initialize the app
initApp();