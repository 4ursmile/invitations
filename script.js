
// Configuration
const config = {
    // Default folder data (fallback if folder reading fails)
    defaultFolders: [
        {
            name: 'graduation',
            title: 'Graduation Party',
            description: 'Celebrate academic achievements with elegant graduation invitations',
            icon: '🎓',
            color: '#ff69b4'
        },
        {
            name: 'wedding',
            title: 'Wedding Ceremony',
            description: 'Beautiful wedding invitations for your special day',
            icon: '💒',
            color: '#ff1493'
        },
        {
            name: 'birthday',
            title: 'Birthday Party',
            description: 'Fun and colorful birthday celebration invitations',
            icon: '🎂',
            color: '#ff6b6b'
        },
        {
            name: 'baby-shower',
            title: 'Baby Shower',
            description: 'Sweet and gentle invitations for baby celebrations',
            icon: '👶',
            color: '#ffa8cc'
        },
        {
            name: 'anniversary',
            title: 'Anniversary',
            description: 'Romantic anniversary celebration invitations',
            icon: '💕',
            color: '#ff69b4'
        },
        {
            name: 'corporate',
            title: 'Corporate Events',
            description: 'Professional invitations for business occasions',
            icon: '🏢',
            color: '#ff8fab'
        }
    ],
    // Folder icons mapping
    folderIcons: {
        'graduation': '🎓',
        'wedding': '💒',
        'birthday': '🎂',
        'baby-shower': '👶',
        'baby_shower': '👶',
        'babyshower': '👶',
        'anniversary': '💕',
        'corporate': '🏢',
        'business': '🏢',
        'party': '🎉',
        'celebration': '🎊',
        'holiday': '🎄',
        'christmas': '🎄',
        'new-year': '🎆',
        'halloween': '🎃',
        'valentine': '💝',
        'easter': '🐰',
        'thanksgiving': '🦃',
        'housewarming': '🏠',
        'retirement': '🌅',
        'bridal-shower': '👰',
        'engagement': '💍',
        'quinceañera': '👑',
        'sweet-16': '🍰',
        'baptism': '✨',
        'communion': '🕊️',
        'confirmation': '⛪',
        'bar-mitzvah': '📜',
        'bat-mitzvah': '📜',
        'funeral': '🕯️',
        'memorial': '🕊️',
        'default': '📋'
    },
    // Folder colors
    folderColors: [
        '#ff69b4', '#ff1493', '#ff6b6b', '#ffa8cc', 
        '#ff8fab', '#ffb3ba', '#ff9999', '#ffccdd',
        '#ff6347', '#ff4500', '#ff69b4', '#da70d6'
    ]
};

// Global state
let currentFolders = [];
let isLoading = false;

// Utility functions
function getCurrentPath() {
    return window.location.pathname;
}

function formatFolderName(folderName) {
    return folderName
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getFolderIcon(folderName) {
    const lowerName = folderName.toLowerCase().replace(/[\s_-]+/g, '-');
    return config.folderIcons[lowerName] || config.folderIcons.default;
}

function getFolderColor(index) {
    return config.folderColors[index % config.folderColors.length];
}

function generateFolderDescription(folderName) {
    const descriptions = {
        'graduation': 'Celebrate academic achievements with elegant graduation invitations',
        'wedding': 'Beautiful wedding invitations for your special day',
        'birthday': 'Fun and colorful birthday celebration invitations',
        'baby-shower': 'Sweet and gentle invitations for baby celebrations',
        'anniversary': 'Romantic anniversary celebration invitations',
        'corporate': 'Professional invitations for business occasions',
        'party': 'Exciting party invitations for any celebration',
        'holiday': 'Festive holiday celebration invitations',
        'business': 'Professional business event invitations'
    };
    
    const lowerName = folderName.toLowerCase().replace(/[\s_-]+/g, '-');
    return descriptions[lowerName] || `Beautiful ${formatFolderName(folderName)} invitations for your special event`;
}

// Folder reading functions
async function readFoldersFromServer() {
    try {
        // Try to fetch folder list from server
        const response = await fetch('/api/folders' + getCurrentPath());
        if (response.ok) {
            const folders = await response.json();
            return folders.map((folder, index) => ({
                name: folder.name,
                title: formatFolderName(folder.name),
                description: generateFolderDescription(folder.name),
                icon: getFolderIcon(folder.name),
                color: getFolderColor(index),
                type: folder.type || 'folder'
            }));
        }
        throw new Error('Server response not ok');
    } catch (error) {
        console.log('Server folder reading failed, trying alternative methods:', error.message);
        return null;
    }
}

async function readFoldersFromFileSystem() {
    try {
        // Try to use File System Access API (modern browsers)
        if ('showDirectoryPicker' in window) {
            // This would require user interaction, so we skip it for automatic loading
            return null;
        }
        
        // Try to read from current directory using fetch
        const response = await fetch('./');
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract folder links from directory listing
            const links = doc.querySelectorAll('a[href]');
            const folders = [];
            
            links.forEach((link, index) => {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                
                // Filter out parent directory, files, and system folders
                if (href && 
                    !href.startsWith('../') && 
                    !href.startsWith('http') && 
                    !href.includes('.') && 
                    href.endsWith('/') &&
                    text !== '.' && 
                    text !== '..' &&
                    !text.startsWith('.')) {
                    
                    const folderName = href.replace(/\/$/, '');
                    folders.push({
                        name: folderName,
                        title: formatFolderName(folderName),
                        description: generateFolderDescription(folderName),
                        icon: getFolderIcon(folderName),
                        color: getFolderColor(index),
                        type: 'folder'
                    });
                }
            });
            
            return folders.length > 0 ? folders : null;
        }
        throw new Error('Directory listing not available');
    } catch (error) {
        console.log('File system reading failed:', error.message);
        return null;
    }
}

function readFoldersFromConfig() {
    // Use default configuration folders
    return config.defaultFolders.map((folder, index) => ({
        ...folder,
        color: getFolderColor(index)
    }));
}

// Main folder reading function
async function loadFolders() {
    isLoading = true;
    showLoadingState();
    
    try {
        // Try multiple methods to read folders
        let folders = await readFoldersFromServer();
        
        if (!folders) {
            folders = await readFoldersFromFileSystem();
        }
        
        if (!folders || folders.length === 0) {
            folders = readFoldersFromConfig();
            showNotification('📁 Using default folders - Connect to server for dynamic folder detection', '#ff69b4');
        }
        
        currentFolders = folders;
        createInvitationCards(folders);
        
    } catch (error) {
        console.error('Error loading folders:', error);
        showErrorState();
    } finally {
        isLoading = false;
    }
}

// UI Creation Functions
function showLoadingState() {
    const grid = document.getElementById('invitationsGrid');
    grid.innerHTML = `
        <div class="loading-card">
            <div class="loading-spinner"></div>
            <p style="color: #666; font-size: 18px;">Loading invitation folders...</p>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">Discovering available invitation types</p>
        </div>
    `;
}

function showErrorState() {
    const grid = document.getElementById('invitationsGrid');
    grid.innerHTML = `
        <div class="invitation-card error-card">
            <div class="card-icon" style="color: #ff6b6b;">⚠️</div>
            <h3 class="card-title">Unable to Load Folders</h3>
            <p class="card-description">
                There was an issue loading the invitation folders. 
                Please check your connection or try refreshing the page.
            </p>
            <button class="card-button" onclick="loadFolders()" style="background: linear-gradient(45deg, #ff6b6b, #ff4757);">
                Try Again 🔄
            </button>
        </div>
    `;
}

// Function to create invitation cards
function createInvitationCards(folders = currentFolders) {
    const grid = document.getElementById('invitationsGrid');
    grid.innerHTML = ''; // Clear existing content
    
    folders.forEach((folder, index) => {
        const card = document.createElement('div');
        card.className = 'invitation-card';
        card.style.animationDelay = `${0.8 + index * 0.2}s`;
        
        card.innerHTML = `
            <div class="card-icon" style="color: ${folder.color};">
                ${folder.icon}
            </div>
            <h3 class="card-title">${folder.title}</h3>
            <p class="card-description">${folder.description}</p>
            <div class="card-button">
                View Invitations ✨
            </div>
        `;
        
        // Add click event for card (excluding button clicks)
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                navigateToFolder(folder.name);
            }
        });
        
        // Add ripple effect
        card.addEventListener('click', createRipple);
        
        grid.appendChild(card);
    });
    
    // Add "Create New" card
    createAddNewCard(grid, folders.length);
}

function createAddNewCard(grid, folderCount) {
    const addCard = document.createElement('div');
    addCard.className = 'invitation-card add-new-card';
    addCard.style.animationDelay = `${0.8 + folderCount * 0.2}s`;
    
    addCard.innerHTML = `
        <div class="add-icon">➕</div>
        <h3 class="card-title">Create New Folder</h3>
        <p class="card-description">Add a new invitation category or create custom designs</p>
    `;
    
    addCard.addEventListener('click', () => {
        showCreateFolderDialog();
    });
    
    grid.appendChild(addCard);
}

// // Navigation functions
// function navigateToFolder(folderName) {
//     const currentPath = getCurrentPath();
//     const newPath = currentPath.endsWith('/') ? 
//         `${currentPath}${folderName}/` : 
//         `${currentPath}/${folderName}/`;
    
//     // Add loading animation before navigation
//     showNotification(`📂 Opening ${formatFolderName(folderName)} invitations...`, '#ff69b4');
    
//     setTimeout(() => {
//         window.location.href = newPath;
//     }, 500);
// }
// Navigation functions
function navigateToFolder(folderName) {
    var currentPath = getCurrentPath();
    // if the current path is *.html or *.html/, remove the last part
    if (currentPath.endsWith('.html') || currentPath.endsWith('.html/')) {
        // slice off the last part
        currentPath = currentPath.slice(0, currentPath.lastIndexOf('/'));
    }
    console.log('Current path:', currentPath);
    const newPath = currentPath.endsWith('/') ? 
        `${currentPath}${folderName}/` : 
        `${currentPath}/${folderName}/`;
    
    // Add loading animation before navigation
    showNotification(`📂 Opening ${formatFolderName(folderName)} invitations...`, '#ff69b4');
    if (checkPageExists(newPath)) {
        setTimeout(() => {
            window.location.href = newPath;
        }, 500);
    }
    else {
        setTimeout(() => {
            show404Page();
        }, 500);
    }
}

// 404 Page Functions
function show404Page() {
    document.body.innerHTML = `
        <div class="floating-shapes">
            <!-- 3D Cube -->
            <div class="shape">
                <div class="shape-3d cube">
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                </div>
            </div>
            
            <!-- 3D Pyramid -->
            <div class="shape">
                <div class="shape-3d pyramid">
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                </div>
            </div>
            
            <!-- 3D Sphere -->
            <div class="shape">
                <div class="sphere"></div>
            </div>
            
            <!-- 3D Cube -->
            <div class="shape">
                <div class="shape-3d cube">
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                </div>
            </div>
            
            <!-- 3D Pyramid -->
            <div class="shape">
                <div class="shape-3d pyramid">
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                    <div class="face"></div>
                </div>
            </div>
            
            <!-- 3D Sphere -->
            <div class="shape">
                <div class="sphere"></div>
            </div>
        </div>

        <div class="container">
            <div class="header">
                <h1 class="main-title" style="font-size: 72px; margin-bottom: 10px;">404</h1>
                <p class="subtitle" style="font-size: 28px; color: #ff69b4; margin-bottom: 20px;">Page Not Found</p>
                <div class="decorative-line"></div>
            </div>

            <div class="invitations-grid" style="max-width: 800px;">
                <div class="invitation-card" style="grid-column: 1 / -1; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
                    <div class="card-icon" style="color: #ff69b4; font-size: 60px; margin-bottom: 30px;">
                        🔍
                    </div>
                    <h3 class="card-title" style="font-size: 32px; margin-bottom: 20px; color: #ff69b4;">
                        Oops! This page seems to be missing
                    </h3>
                    <p class="card-description" style="font-size: 18px; line-height: 1.8; margin-bottom: 35px;">
                        The invitation page you're looking for might have been moved, deleted, or doesn't exist yet. 
                        Don't worry though - let's get you back to creating beautiful invitations! ✨
                    </p>
                    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="goToMainPage()" class="card-button" style="font-size: 18px; padding: 15px 35px;">
                            🏠 Back to Home
                        </button>
                        <button onclick="showCreateFolderDialog()" class="card-button" style="background: linear-gradient(45deg, #ff8fab, #ffa8cc); font-size: 18px; padding: 15px 35px;">
                            ➕ Create New Folder
                        </button>
                    </div>
                    <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid rgba(255, 105, 180, 0.2);">
                        <p style="color: #999; font-size: 16px; margin-bottom: 15px;">
                            💡 Quick Actions:
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="refreshPage()" style="background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 105, 180, 0.3); color: #ff69b4; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                                🔄 Refresh
                            </button>
                            <button onclick="goBack()" style="background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 105, 180, 0.3); color: #ff69b4; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                                ⬅️ Go Back
                            </button>
                            <button onclick="loadFolders()" style="background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 105, 180, 0.3); color: #ff69b4; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                                📁 Load Folders
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p class="footer-text">✨ Let's get you back to creating beautiful invitations ✨</p>
                <div class="social-links">
                    <a href="#" class="social-link" onclick="goToMainPage()">🏠</a>
                    <a href="#" class="social-link" onclick="refreshPage()">🔄</a>
                    <a href="#" class="social-link" onclick="loadFolders()">📁</a>
                    <a href="#" class="social-link" onclick="showCreateFolderDialog()">➕</a>
                </div>
            </div>
        </div>
    `;
    
    // Re-setup 3D shapes for 404 page
    setup3DShapes();
    
    // Add custom 404 page animations
    const cards = document.querySelectorAll('.invitation-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${0.8 + index * 0.2}s`;
    });
    
    // Show 404 notification
    setTimeout(() => {
        showNotification('🔍 Page not found - but we\'re here to help!', '#ff69b4');
    }, 1000);
}

function goToMainPage() {
    showNotification('🏠 Returning to main page...', '#4CAF50');
    setTimeout(() => {
        // Try to navigate to the root or main page
        const pathSegments = window.location.pathname.split('/').filter(segment => segment);
        if (pathSegments.length > 0) {
            // Go to parent directory
            window.location.href = '/';
        } else {
            // Already at root, reload the page
            window.location.reload();
        }
    }, 500);
}

function goBack() {
    showNotification('⬅️ Going back...', '#ff8fab');
    setTimeout(() => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            goToMainPage();
        }
    }, 500);
}

function refreshPage() {
    showNotification('🔄 Refreshing page...', '#ffa8cc');
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// Check if current page exists
function checkPageExists(currentPath) {
    // check if the current path is a valid folder or file
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', currentPath, false); // Synchronous request
    try {
        xhr.send();
        return xhr.status >= 200 && xhr.status < 400; // Check for valid response
    } catch (error) {
        console.error('Error checking page existence:', error);
        return false;
    }
}

// Auto-trigger 404 for missing pages
function handleMissingPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const is404 = urlParams.get('404') === 'true';
    
    if (is404 || window.location.pathname.includes('/404')) {
        show404Page();
        return true;
    }
    return false;
}

// Create folder dialog
function showCreateFolderDialog() {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    dialog.innerHTML = `
        <div style="
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        ">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">🎨 Create New Folder</h2>
            <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                Enter a name for your new invitation folder. This will create a new category 
                for organizing your custom invitations.
            </p>
            <input type="text" id="folderNameInput" placeholder="e.g., Sweet 16, Retirement, etc." style="
                width: 100%;
                padding: 15px;
                border: 2px solid rgba(255, 105, 180, 0.3);
                border-radius: 10px;
                font-size: 16px;
                margin-bottom: 30px;
                outline: none;
                transition: border-color 0.3s ease;
            ">
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="createNewFolder()" style="
                    background: linear-gradient(45deg, #ff69b4, #ff1493);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Create Folder ✨</button>
                <button onclick="closeCreateDialog()" style="
                    background: rgba(150, 150, 150, 0.2);
                    color: #666;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Animate in
    setTimeout(() => {
        dialog.style.opacity = '1';
        dialog.querySelector('div').style.transform = 'scale(1)';
    }, 10);
    
    // Focus input
    setTimeout(() => {
        document.getElementById('folderNameInput').focus();
    }, 300);
    
    // Handle enter key
    document.getElementById('folderNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createNewFolder();
        }
    });
    
    // Store dialog reference
    window.currentDialog = dialog;
}

function createNewFolder() {
    const input = document.getElementById('folderNameInput');
    const folderName = input.value.trim();
    
    if (!folderName) {
        showNotification('⚠️ Please enter a folder name', '#ff6b6b');
        return;
    }
    
    // Validate folder name
    const sanitizedName = folderName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    
    if (currentFolders.some(folder => folder.name === sanitizedName)) {
        showNotification('⚠️ A folder with this name already exists', '#ff6b6b');
        return;
    }
    
    // Create new folder object
    const newFolder = {
        name: sanitizedName,
        title: formatFolderName(folderName),
        description: generateFolderDescription(folderName),
        icon: getFolderIcon(folderName),
        color: getFolderColor(currentFolders.length),
        type: 'folder'
    };
    
    // Add to current folders
    currentFolders.push(newFolder);
    
    // Recreate cards
    createInvitationCards();
    
    // Close dialog
    closeCreateDialog();
    
    // Show success notification
    showNotification(`✅ Folder "${newFolder.title}" created successfully!`, '#4CAF50');
    
    // Optionally navigate to new folder
    setTimeout(() => {
        if (confirm(`Would you like to open the new "${newFolder.title}" folder?`)) {
            navigateToFolder(newFolder.name);
        }
    }, 1000);
}

function closeCreateDialog() {
    const dialog = window.currentDialog;
    if (dialog) {
        dialog.style.opacity = '0';
        dialog.querySelector('div').style.transform = 'scale(0.8)';
        setTimeout(() => {
            dialog.remove();
            window.currentDialog = null;
        }, 300);
    }
}

// Create ripple effect
function createRipple(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    card.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Notification system
function showNotification(message, color = '#ff69b4') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.backgroundColor = color;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 3D Shapes Interaction functions
function setup3DShapes() {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    
    shapes.forEach((shape, index) => {
        shape.addEventListener('click', function(e) {
            e.stopPropagation();
            this.style.animation = 'none';
            this.style.transform = 'scale(1.5) rotateY(720deg) rotateX(360deg)';
            createShapeExplosion(this);
            setTimeout(() => {
                this.style.animation = `float${(index % 6) + 1} ${8 + index}s ease-in-out infinite`;
                this.style.transform = '';
            }, 1000);
        });
        
        shape.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            teleportShape(this);
        });
    });
}

function createShapeExplosion(shape) {
    const rect = shape.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, #ff69b4, #ffc3a0);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / 15) * Math.PI * 2;
        const velocity = 100 + Math.random() * 100;
        const gravity = 0.5;
        
        let x = 0, y = 0, vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
        
        const animate = () => {
            x += vx * 0.016;
            y += vy * 0.016;
            vy += gravity;
            
            particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - (y + Math.abs(x)) * 0.01})`;
            particle.style.opacity = Math.max(0, 1 - (y + Math.abs(x)) * 0.01);
            
            if (particle.style.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function teleportShape(shape) {
    const fadeOut = [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0) rotateY(180deg)' }
    ];
    
    const fadeIn = [
        { opacity: 0, transform: 'scale(0) rotateY(180deg)' },
        { opacity: 1, transform: 'scale(1) rotateY(0deg)' }
    ];
    
    shape.animate(fadeOut, { duration: 300 }).onfinish = () => {
        const newX = Math.random() * (window.innerWidth - 150);
        const newY = Math.random() * (window.innerHeight - 150);
        
        shape.style.left = newX + 'px';
        shape.style.top = newY + 'px';
        shape.style.right = 'auto';
        shape.style.bottom = 'auto';
        
        shape.animate(fadeIn, { duration: 300 });
    };
}

// Enhanced mouse movement parallax
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    shapes.forEach((shape, index) => {
        const intensity = (index + 1) * 15;
        const rotateX = y * intensity * 0.5;
        const rotateY = x * intensity * 0.5;
        const translateX = x * intensity;
        const translateY = y * intensity;
        
        if (!shape.matches(':hover')) {
            const currentTransform = shape.style.transform || '';
            shape.style.transform = `${currentTransform} translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });
});

// Keyboard interactions
document.addEventListener('keydown', (e) => {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            shapes.forEach(shape => {
                shape.style.animation = 'none';
                shape.style.transform = 'scale(1.2) rotateY(360deg) rotateX(180deg)';
                setTimeout(() => {
                    shape.style.animation = '';
                    shape.style.transform = '';
                }, 1000);
            });
            break;
        case 'r':
        case 'R':
            shapes.forEach(shape => teleportShape(shape));
            break;
        case 'e':
        case 'E':
            shapes.forEach(shape => createShapeExplosion(shape));
            break;
        case 'Escape':
            closeCreateDialog();
            break;
    }
});

// Refresh function
function refreshFolders() {
    showNotification('🔄 Refreshing folders...', '#ff69b4');
    loadFolders();
}

// Search functionality
function searchFolders(query) {
    if (!query.trim()) {
        createInvitationCards(currentFolders);
        return;
    }
    
    const filtered = currentFolders.filter(folder => 
        folder.title.toLowerCase().includes(query.toLowerCase()) ||
        folder.description.toLowerCase().includes(query.toLowerCase()) ||
        folder.name.toLowerCase().includes(query.toLowerCase())
    );
    
    createInvitationCards(filtered);
    
    if (filtered.length === 0) {
        const grid = document.getElementById('invitationsGrid');
        grid.innerHTML += `
            <div class="invitation-card" style="grid-column: 1 / -1;">
                <div class="card-icon" style="color: #999;">🔍</div>
                <h3 class="card-title">No Results Found</h3>
                <p class="card-description">
                    No invitation folders match your search for "${query}". 
                    Try a different search term or create a new folder.
                </p>
                <button class="card-button" onclick="showCreateFolderDialog()">
                    Create New Folder ➕
                </button>
            </div>
        `;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up 3D shapes
    setup3DShapes();
    
    // Load folders
    loadFolders();
    
    // Add keyboard shortcuts info
    console.log(`
🎮 Keyboard Shortcuts:
• Space: Animate all shapes
• R: Teleport shapes randomly  
• E: Create explosions
• Esc: Close dialogs

🖱️ Mouse Interactions:
• Click shapes: Trigger explosion animation
• Double-click shapes: Teleport to random position
• Hover shapes: Pause animations
    `);
    
    // Add refresh button functionality
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            refreshFolders();
        }
    });
});

// Export functions for global access
window.loadFolders = loadFolders;
window.refreshFolders = refreshFolders;
window.searchFolders = searchFolders;
window.createNewFolder = createNewFolder;
window.closeCreateDialog = closeCreateDialog;
window.showCreateFolderDialog = showCreateFolderDialog;
