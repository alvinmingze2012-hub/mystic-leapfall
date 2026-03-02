// Game State and Variables
let canvas, ctx;
let gameRunning = false;
let gamePaused = false;
let currentLevel = 1;
let score = 0;
let health = 3;
let startTime;
let timerInterval;
let levelComplete = false;
let playerSpeed = 5; // FIXED - never changes
let totalLevels = 15; // 15 levels total

// Player Object
let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    speed: 5, // FIXED - always 5
    jumpPower: -12,
    gravity: 0.5,
    grounded: false,
    canDoubleJump: true,
    canDash: true,
    hasShield: false,
    invincible: false,
    invincibilityTimer: 0
};

// Power-ups
let powerups = {
    doubleJump: false,
    dash: false,
    shield: false
};

// Platforms - will be set per level
let platforms = [];

// Collectibles - will be set per level
let collectibles = [];

// Enemies - will be set per level
let enemies = [];

// Keys Pressed
let keys = {
    left: false,
    right: false,
    space: false,
    shift: false,
    q: false
};

// Level data storage
let levelData = {};

// Level completion status for checkmarks
let levelCompleted = {};

// Initialize level completed for 15 levels
for (let i = 1; i <= totalLevels; i++) {
    levelCompleted[i] = false;
}

// Level themes
const themes = {
    1: { name: 'Enchanted Forest', bg: '#87CEEB', platform: 'grass', difficulty: 'Easy' },
    2: { name: 'Crystal Caverns', bg: '#4A148C', platform: 'crystal', difficulty: 'Easy' },
    3: { name: 'Sky Fortress', bg: '#87CEEB', platform: 'cloud', difficulty: 'Easy' },
    4: { name: 'Lava Depths', bg: '#8B0000', platform: 'stone', difficulty: 'Medium' },
    5: { name: 'Frozen Peaks', bg: '#E0F2FE', platform: 'ice', difficulty: 'Medium' },
    6: { name: 'Ancient Temple', bg: '#CD853F', platform: 'stone', difficulty: 'Medium' },
    7: { name: 'Haunted Woods', bg: '#2D5A27', platform: 'wood', difficulty: 'Medium' },
    8: { name: 'Desert Ruins', bg: '#F4A460', platform: 'sand', difficulty: 'Hard' },
    9: { name: 'Storm Citadel', bg: '#483D8B', platform: 'stone', difficulty: 'Hard' },
    10: { name: 'Magical Gardens', bg: '#98FB98', platform: 'grass', difficulty: 'Hard' },
    11: { name: 'Dragon\'s Lair', bg: '#B22222', platform: 'stone', difficulty: 'Hard' },
    12: { name: 'Celestial Realm', bg: '#191970', platform: 'cloud', difficulty: 'Expert' },
    13: { name: 'Abyssal Depths', bg: '#000080', platform: 'crystal', difficulty: 'Expert' },
    14: { name: 'Chrono Keep', bg: '#2F4F4F', platform: 'stone', difficulty: 'Expert' },
    15: { name: 'Mystic Throne', bg: '#4B0082', platform: 'crystal', difficulty: 'Legendary' }
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Event Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Settings listeners
    document.getElementById('sfxVolume').addEventListener('input', updateSFXVolume);
    document.getElementById('musicVolume').addEventListener('input', updateMusicVolume);
    
    // Generate all levels FIRST
    generateAllLevels();
    
    // Then setup level selection
    setupLevelSelection();
    
    // Game buttons
    setupGameButtons();
    
    // Start with main menu
    showMainMenu();
});

// Generate all 15 levels
function generateAllLevels() {
    console.log("Generating all levels..."); // Debug log
    for (let level = 1; level <= totalLevels; level++) {
        levelData[level] = generateLevel(level);
        console.log(`Level ${level} generated with ${levelData[level].platforms.length} platforms`); // Debug log
    }
}

// Generate a single level with procedural design
function generateLevel(level) {
    const theme = themes[level];
    // Fix: Make sure theme exists
    if (!theme) {
        console.error(`Theme not found for level ${level}`);
        return { platforms: [], collectibles: [], enemies: [] };
    }
    
    const difficulty = level <= 3 ? 1 : level <= 6 ? 2 : level <= 10 ? 3 : level <= 13 ? 4 : 5;
    
    let platforms = [];
    let collectibles = [];
    let enemies = [];
    
    // Base platform (starting platform) - ENSURE THIS IS CREATED
    platforms.push({ 
        x: 0, y: 350, width: 200, height: 20, 
        texture: theme.platform,
        isStart: true 
    });
    
    // Generate platforms based on level
    let platformCount = 5 + difficulty * 2;
    let lastX = 200;
    let lastY = 350;
    
    for (let i = 0; i < platformCount; i++) {
        let width = 80 + Math.floor(Math.random() * 70);
        let gap = 80 + Math.floor(Math.random() * 50);
        let yChange = (Math.random() > 0.5 ? -30 : 30) * difficulty;
        
        // Ensure platforms aren't too high or low
        let newY = Math.max(150, Math.min(350, lastY + yChange));
        
        let platformX = lastX + gap;
        
        // Make sure platform is within canvas
        if (platformX + width < 800) {
            platforms.push({
                x: platformX,
                y: newY,
                width: width,
                height: 20,
                texture: theme.platform
            });
            
            // Add collectibles on platforms
            if (Math.random() > 0.4) {
                collectibles.push({
                    x: platformX + width / 2 - 10,
                    y: newY - 30,
                    width: 20,
                    height: 20,
                    collected: false,
                    type: Math.random() > 0.7 ? 'powerup' : 'coin',
                    value: Math.random() > 0.7 ? 100 : 50
                });
            }
            
            // Add enemies on platforms
            if (Math.random() > 0.6) {
                let enemyType = Math.random() > 0.5 ? 'walker' : 'stationary';
                let enemySpeed = enemyType === 'walker' ? 1 + difficulty * 0.2 : 0;
                
                enemies.push({
                    x: platformX + 20,
                    y: newY - 25,
                    width: 25,
                    height: 25,
                    speed: enemySpeed,
                    direction: 1,
                    type: enemyType,
                    patrolStart: platformX,
                    patrolEnd: platformX + width - 25,
                    platformY: newY
                });
            }
            
            lastX = platformX;
            lastY = newY;
        }
    }
    
    // Final platform (level exit) - ENSURE THIS IS WITHIN CANVAS
    let exitX = Math.min(lastX + 100, 700);
    platforms.push({
        x: exitX,
        y: 300,
        width: 100,
        height: 20,
        texture: theme.platform,
        isExit: true
    });
    
    // Add special collectible at exit
    if (exitX + 150 < 800) {
        collectibles.push({
            x: exitX + 50,
            y: 270,
            width: 20,
            height: 20,
            collected: false,
            type: 'shield',
            value: 200
        });
    }
    
    // Add some floating collectibles in hard levels
    if (difficulty >= 3) {
        for (let i = 0; i < difficulty; i++) {
            if (platforms.length > i + 1) {
                let p = platforms[i + 1];
                collectibles.push({
                    x: p.x + 30,
                    y: p.y - 60,
                    width: 20,
                    height: 20,
                    collected: false,
                    type: 'doublejump',
                    value: 150
                });
            }
        }
    }
    
    return { platforms, collectibles, enemies };
}

// Setup level selection with dynamic grid
function setupLevelSelection() {
    const levelGrid = document.querySelector('.level-grid');
    if (!levelGrid) {
        console.error("Level grid not found!");
        return;
    }
    
    levelGrid.innerHTML = ''; // Clear existing
    
    // Create level cards for all 15 levels
    for (let i = 1; i <= totalLevels; i++) {
        const theme = themes[i];
        if (!theme) continue;
        
        const card = document.createElement('div');
        card.className = 'level-card';
        card.setAttribute('data-level', i);
        
        // Add preview with theme color
        const preview = document.createElement('div');
        preview.className = `level-preview ${theme.platform}`;
        preview.style.background = `linear-gradient(135deg, ${theme.bg}, ${adjustColor(theme.bg, -30)})`;
        
        const title = document.createElement('h3');
        title.textContent = theme.name;
        
        const desc = document.createElement('p');
        desc.textContent = `Difficulty: ${theme.difficulty}`;
        
        const difficultySpan = document.createElement('span');
        difficultySpan.className = `difficulty ${theme.difficulty.toLowerCase()}`;
        difficultySpan.textContent = getDifficultyEmoji(theme.difficulty) + ' ' + theme.difficulty;
        
        // Checkmark for completed levels
        const checkmark = document.createElement('div');
        checkmark.className = 'checkmark';
        checkmark.innerHTML = '✓';
        checkmark.style.display = 'none';
        
        card.appendChild(preview);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(difficultySpan);
        card.appendChild(checkmark);
        
        // Add click handler
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Load the level
            loadLevel(i);
        });
        
        levelGrid.appendChild(card);
    }
}

// Helper function to adjust color brightness
function adjustColor(color, percent) {
    // Simple color adjustment for preview
    return color;
}

// Get emoji for difficulty
function getDifficultyEmoji(difficulty) {
    switch(difficulty) {
        case 'Easy': return '🌱';
        case 'Medium': return '⭐';
        case 'Hard': return '🔥';
        case 'Expert': return '💀';
        case 'Legendary': return '👑';
        default: return '✨';
    }
}

// Update level selection checkmarks
function updateLevelCheckmarks() {
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach((card, index) => {
        const levelNum = index + 1;
        const checkmark = card.querySelector('.checkmark');
        if (checkmark) {
            checkmark.style.display = levelCompleted[levelNum] ? 'block' : 'none';
        }
    });
}

// Setup game buttons
function setupGameButtons() {
    // Try Again button
    const tryAgainBtn = document.querySelector('#gameOver button:first-child');
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', restartFromLevel1);
    }
    
    // Restart Level button
    const restartBtn = document.querySelector('#pauseMenu button:nth-child(2)');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartCurrentLevel);
    }
    
    // Choose Realm button
    const chooseRealmBtn = document.querySelector('#gameOver button:last-child');
    if (chooseRealmBtn) {
        chooseRealmBtn.addEventListener('click', showLevelSelect);
    }
}

// Menu Navigation Functions
function showMainMenu() {
    document.getElementById('mainMenu').classList.add('active');
    document.getElementById('levelSelect').classList.remove('active');
    document.getElementById('instructions').classList.remove('active');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    
    if (gameRunning) {
        stopGame();
    }
}

function showLevelSelect() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('levelSelect').classList.add('active');
    document.getElementById('instructions').classList.remove('active');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    updateLevelCheckmarks();
}

function showInstructions() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('levelSelect').classList.remove('active');
    document.getElementById('instructions').classList.add('active');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('gameScreen').classList.add('hidden');
}

function showSettings() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('levelSelect').classList.remove('active');
    document.getElementById('instructions').classList.remove('active');
    document.getElementById('settings').classList.add('active');
    document.getElementById('gameScreen').classList.add('hidden');
}

// Game Control Functions
function startGame() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    loadLevel(1);
}

function loadLevel(level) {
    console.log(`Loading level ${level}`); // Debug log
    
    currentLevel = level;
    resetGame();
    
    // Check if level data exists
    if (!levelData[level]) {
        console.error(`Level ${level} data not found, generating now...`);
        levelData[level] = generateLevel(level);
    }
    
    // Load level data
    const levelInfo = levelData[level];
    
    // Make deep copies to avoid reference issues
    platforms = levelInfo.platforms.map(p => ({...p}));
    collectibles = levelInfo.collectibles.map(c => ({...c, collected: false}));
    enemies = levelInfo.enemies.map(e => ({...e}));
    
    console.log(`Loaded ${platforms.length} platforms, ${collectibles.length} collectibles, ${enemies.length} enemies`); // Debug log
    
    // Set spawn point on first platform
    if (platforms.length > 0) {
        const firstPlatform = platforms[0];
        player.x = firstPlatform.x + 50;
        player.y = firstPlatform.y - player.height;
        console.log(`Spawn point set to (${player.x}, ${player.y})`); // Debug log
    } else {
        console.error("No platforms found for level!");
        // Fallback platform
        platforms = [{ x: 0, y: 350, width: 200, height: 20, texture: 'grass' }];
        player.x = 100;
        player.y = 330;
    }
    
    document.getElementById('levelNameDisplay').textContent = themes[level]?.name || `Level ${level}`;
    
    startGameLoop();
}

function resetGame() {
    // Reset player speed to 5
    player.speed = 5;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = true;
    player.canDoubleJump = true;
    player.invincible = false;
    player.hasShield = false;
    player.invincibilityTimer = 0;
    
    health = 3;
    score = 0;
    levelComplete = false;
    
    // Reset powerups
    powerups.doubleJump = false;
    powerups.dash = false;
    powerups.shield = false;
    
    updateHUD();
    updatePowerupIcons();
    
    // Start timer
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function stopGame() {
    gameRunning = false;
    clearInterval(timerInterval);
}

function pauseGame() {
    if (!gameRunning || gamePaused || levelComplete) return;
    gamePaused = true;
    document.getElementById('pauseMenu').classList.remove('hidden');
}

function resumeGame() {
    gamePaused = false;
    document.getElementById('pauseMenu').classList.add('hidden');
}

function restartFromLevel1() {
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    loadLevel(1);
}

function restartCurrentLevel() {
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    loadLevel(currentLevel);
}

function nextLevel() {
    if (currentLevel < totalLevels) {
        loadLevel(currentLevel + 1);
    } else {
        // Game completed - show congratulations
        alert('Congratulations! You completed all levels! 🎉');
        showMainMenu();
    }
    document.getElementById('levelComplete').classList.add('hidden');
}

// Keyboard Handlers
function handleKeyDown(e) {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.left = true;
            e.preventDefault();
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.right = true;
            e.preventDefault();
            break;
        case ' ':
        case 'Space':
            keys.space = true;
            e.preventDefault();
            break;
        case 'Shift':
            keys.shift = true;
            e.preventDefault();
            break;
        case 'q':
        case 'Q':
            keys.q = true;
            e.preventDefault();
            break;
        case 'Escape':
            pauseGame();
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
            keys.left = false;
            e.preventDefault();
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            keys.right = false;
            e.preventDefault();
            break;
        case ' ':
        case 'Space':
            keys.space = false;
            e.preventDefault();
            break;
        case 'Shift':
            keys.shift = false;
            e.preventDefault();
            break;
        case 'q':
        case 'Q':
            keys.q = false;
            e.preventDefault();
            break;
    }
}

// Game Loop
function startGameLoop() {
    gameRunning = true;
    gamePaused = false;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameRunning) return;
    
    if (!gamePaused && !levelComplete) {
        update();
    }
    
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Keep speed fixed at 5
    player.speed = 5;
    
    // Apply gravity
    player.velocityY += player.gravity;
    
    // Horizontal movement
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.7;
    }
    
    // Jump
    if (keys.space) {
        if (player.grounded) {
            player.velocityY = player.jumpPower;
            player.grounded = false;
            player.canDoubleJump = true;
            playSound('jumpSound');
        } else if (player.canDoubleJump && powerups.doubleJump) {
            player.velocityY = player.jumpPower;
            player.canDoubleJump = false;
            playSound('jumpSound');
        }
    }
    
    // Dash
    if (keys.shift && player.canDash && powerups.dash) {
        player.velocityX = (keys.right ? 15 : -15);
        player.canDash = false;
        setTimeout(() => { player.canDash = true; }, 1000);
    }
    
    // Magic Shield
    if (keys.q && powerups.shield && !player.hasShield) {
        activateShield();
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    
    // Platform collision
    player.grounded = false;
    for (let platform of platforms) {
        if (player.velocityY >= 0 &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velocityY) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.canDoubleJump = true;
        }
    }
    
    // Update enemies
    for (let enemy of enemies) {
        if (enemy.type === 'walker') {
            enemy.x += enemy.speed * enemy.direction;
            
            // Keep enemy on platform
            if (enemy.x <= enemy.patrolStart || enemy.x + enemy.width >= enemy.patrolEnd) {
                enemy.direction *= -1;
            }
        }
        
        // Enemy collision
        if (!player.invincible &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
                // Player landed on enemy
                enemies = enemies.filter(e => e !== enemy);
                player.velocityY = player.jumpPower / 2;
                score += 100;
                updateHUD();
                playSound('powerupSound');
                break;
            } else {
                // Enemy hit player
                takeDamage();
            }
        }
    }
    
    // Collect items
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let item = collectibles[i];
        if (!item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            item.collected = true;
            score += item.value || 50;
            updateHUD();
            playSound('collectSound');
            
            // Apply powerup
            if (item.type === 'powerup') {
                if (!powerups.doubleJump) powerups.doubleJump = true;
                else if (!powerups.dash) powerups.dash = true;
                else if (!powerups.shield) powerups.shield = true;
            } else if (item.type === 'doublejump') {
                powerups.doubleJump = true;
            } else if (item.type === 'shield') {
                powerups.shield = true;
            }
            
            updatePowerupIcons();
        }
    }
    
    // Check for level completion
    const exitPlatform = platforms.find(p => p.isExit);
    if (exitPlatform && 
        player.x > exitPlatform.x - 50 && 
        player.x < exitPlatform.x + exitPlatform.width + 50) {
        completeLevel();
    }
    
    // Check if player fell off
    if (player.y > canvas.height + 50) {
        takeDamage();
        // Respawn on first platform
        if (platforms.length > 0) {
            const firstPlatform = platforms[0];
            player.x = firstPlatform.x + 50;
            player.y = firstPlatform.y - player.height;
        } else {
            player.x = 100;
            player.y = 300;
        }
        player.velocityX = 0;
        player.velocityY = 0;
    }
    
    // Update invincibility
    if (player.invincible) {
        player.invincibilityTimer--;
        if (player.invincibilityTimer <= 0) {
            player.invincible = false;
        }
    }
}

// Drawing functions with enhanced graphics
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawPlatforms();
    drawCollectibles();
    drawEnemies();
    drawPlayer();
    drawEffects();
}

function drawBackground() {
    const theme = themes[currentLevel] || themes[1];
    
    // Create gradient background
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.bg);
    gradient.addColorStop(1, adjustColor(theme.bg, -50));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add theme-specific decorations
    switch(theme.platform) {
        case 'grass':
            // Draw trees
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 3; i++) {
                let x = (i * 250) % canvas.width;
                ctx.fillRect(x, 200, 10, 150);
                ctx.beginPath();
                ctx.arc(x + 5, 190, 20, 0, Math.PI * 2);
                ctx.fillStyle = '#32CD32';
                ctx.fill();
            }
            break;
            
        case 'crystal':
            // Draw crystals
            for (let i = 0; i < 5; i++) {
                let x = (i * 150) % canvas.width;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(Date.now() * 0.001 + i) * 0.05})`;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + 20, 50);
                ctx.lineTo(x - 20, 50);
                ctx.fill();
            }
            break;
            
        case 'cloud':
            // Draw clouds
            for (let i = 0; i < 3; i++) {
                let x = (i * 200 + Date.now() * 0.02) % (canvas.width + 200) - 100;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(x, 50, 30, 0, Math.PI * 2);
                ctx.arc(x + 40, 50, 25, 0, Math.PI * 2);
                ctx.arc(x + 20, 30, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'ice':
            // Draw snowflakes
            for (let i = 0; i < 10; i++) {
                let x = (i * 80 + Date.now() * 0.01) % canvas.width;
                let y = (i * 50) % canvas.height;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'sand':
            // Draw sand particles
            ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
            }
            break;
            
        case 'wood':
            // Draw leaves
            ctx.fillStyle = 'rgba(0, 100, 0, 0.1)';
            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'stone':
            // Draw rock particles
            ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
            for (let i = 0; i < 15; i++) {
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
            }
            break;
    }
}

function drawPlatforms() {
    for (let platform of platforms) {
        // Platform base
        let baseColor;
        switch(platform.texture) {
            case 'grass': baseColor = '#8B4513'; break;
            case 'crystal': baseColor = '#4A148C'; break;
            case 'cloud': baseColor = '#FFFFFF'; break;
            case 'ice': baseColor = '#E0F2FE'; break;
            case 'sand': baseColor = '#F4A460'; break;
            case 'wood': baseColor = '#8B4513'; break;
            case 'stone': baseColor = '#555555'; break;
            default: baseColor = '#555555';
        }
        
        ctx.fillStyle = baseColor;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform top
        let topColor;
        switch(platform.texture) {
            case 'grass': topColor = '#32CD32'; break;
            case 'crystal': topColor = '#E1BEE7'; break;
            case 'cloud': topColor = '#F0F8FF'; break;
            case 'ice': topColor = '#FFFFFF'; break;
            case 'sand': topColor = '#FFE4B5'; break;
            case 'wood': topColor = '#DEB887'; break;
            case 'stone': topColor = '#888888'; break;
            default: topColor = '#888888';
        }
        
        ctx.fillStyle = topColor;
        ctx.fillRect(platform.x, platform.y - 3, platform.width, 5);
        
        // Platform edge highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(platform.x, platform.y - 2, platform.width, 2);
        
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 3);
        
        // Add platform-specific details
        if (platform.isExit) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(platform.x, platform.y - 10, platform.width, 5);
        }
        if (platform.isStart) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.fillRect(platform.x, platform.y - 5, platform.width, 3);
        }
    }
}

function drawCollectibles() {
    for (let item of collectibles) {
        if (!item.collected) {
            let bounce = Math.sin(Date.now() * 0.005 + item.x) * 3;
            let y = item.y + bounce;
            
            ctx.save();
            
            if (item.type === 'coin') {
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'gold';
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(item.x + item.width/2, y + item.height/2, item.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Coin shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(item.x + item.width/3, y + item.height/3, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.shadowBlur = 20;
                ctx.shadowColor = item.type === 'powerup' ? 'purple' : 
                                 item.type === 'doublejump' ? 'cyan' : 'blue';
                
                ctx.fillStyle = item.type === 'powerup' ? '#9C27B0' : 
                               item.type === 'doublejump' ? '#00BCD4' : '#2196F3';
                ctx.fillRect(item.x, y, item.width, item.height);
                
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let symbol = item.type === 'powerup' ? '✨' : 
                            item.type === 'doublejump' ? '🦶' : '🛡️';
                ctx.fillText(symbol, item.x + item.width/2, y + item.height/2);
            }
            
            ctx.restore();
        }
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        // Enemy body
        ctx.fillStyle = enemy.type === 'walker' ? '#D32F2F' : '#C2185B';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 15, enemy.y + 5, 5, 5);
        
        // Enemy pupils
        let pupilOffsetX = (player.x - enemy.x) * 0.02;
        pupilOffsetX = Math.max(-2, Math.min(2, pupilOffsetX));
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 6 + pupilOffsetX, enemy.y + 6, 3, 3);
        ctx.fillRect(enemy.x + 16 + pupilOffsetX, enemy.y + 6, 3, 3);
        
        // Enemy shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(enemy.x - 2, enemy.y + enemy.height, enemy.width + 4, 3);
    }
}

function drawPlayer() {
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(player.x - 5, player.y + player.height, player.width + 10, 5);
    
    // Player body
    ctx.fillStyle = player.invincible ? 
        `rgba(255, 255, 0, ${0.5 + Math.sin(Date.now() * 0.02) * 0.3})` : '#2196F3';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Cape
    if (powerups.doubleJump || powerups.dash || powerups.shield || player.hasShield) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width, player.y);
        ctx.lineTo(player.x + player.width + 20, player.y + player.height/2);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.fill();
    }
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
    
    // Pupils
    let pupilOffset = player.velocityX > 0 ? 1 : player.velocityX < 0 ? -1 : 0;
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 6 + pupilOffset, player.y + 6, 3, 3);
    ctx.fillRect(player.x + 21 + pupilOffset, player.y + 6, 3, 3);
    
    // Hat
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(player.x + 5, player.y - 5, 20, 5);
    ctx.fillRect(player.x + 10, player.y - 10, 10, 5);
}

function drawEffects() {
    // Invincibility particles
    if (player.invincible) {
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                Math.random() * 3,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // Jump dust
    if (!player.grounded && player.velocityY < 0) {
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
            ctx.fillRect(
                player.x + Math.random() * player.width,
                player.y + player.height,
                5, 5
            );
        }
    }
}

// Helper Functions
function takeDamage() {
    if (player.invincible) return;
    
    if (player.hasShield) {
        player.hasShield = false;
        player.invincible = true;
        player.invincibilityTimer = 60;
        powerups.shield = false;
        updatePowerupIcons();
        playSound('damageSound');
    } else {
        health--;
        player.invincible = true;
        player.invincibilityTimer = 60;
        playSound('damageSound');
        updateHUD();
        
        if (health <= 0) {
            gameOver();
        }
    }
}

function activateShield() {
    if (powerups.shield && !player.hasShield) {
        player.hasShield = true;
        powerups.shield = false;
        player.invincible = true;
        player.invincibilityTimer = 300;
        updatePowerupIcons();
        playSound('powerupSound');
    }
}

function updateHUD() {
    document.getElementById('healthDisplay').textContent = health;
    document.getElementById('scoreDisplay').textContent = score;
}

function updatePowerupIcons() {
    document.getElementById('doubleJumpIcon').classList.toggle('active', powerups.doubleJump);
    document.getElementById('dashIcon').classList.toggle('active', powerups.dash);
    document.getElementById('shieldIcon').classList.toggle('active', powerups.shield || player.hasShield);
}

function updateTimer() {
    if (!gameRunning || gamePaused || levelComplete) return;
    
    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    let minutes = Math.floor(elapsed / 60);
    let seconds = elapsed % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function completeLevel() {
    levelComplete = true;
    levelCompleted[currentLevel] = true;
    
    let collectiblesCount = collectibles.filter(c => c.collected).length;
    let totalCollectibles = collectibles.length;
    
    document.getElementById('levelScore').textContent = `Score: ${score}`;
    document.getElementById('levelTime').textContent = document.getElementById('timerDisplay').textContent;
    document.getElementById('collectiblesFound').textContent = `Collectibles: ${collectiblesCount}/${totalCollectibles}`;
    
    document.getElementById('levelComplete').classList.remove('hidden');
    
    score += collectiblesCount * 100;
    updateHUD();
    updateLevelCheckmarks();
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    document.getElementById('finalTime').textContent = document.getElementById('timerDisplay').textContent;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Audio Functions
function playSound(soundId) {
    let sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {});
    }
}

function updateSFXVolume(e) {
    let volume = e.target.value / 100;
    document.getElementById('sfxValue').textContent = e.target.value + '%';
    document.getElementById('jumpSound').volume = volume;
    document.getElementById('collectSound').volume = volume;
    document.getElementById('damageSound').volume = volume;
    document.getElementById('powerupSound').volume = volume;
}

function updateMusicVolume(e) {
    let volume = e.target.value / 100;
    document.getElementById('musicValue').textContent = e.target.value + '%';
    document.getElementById('bgMusic').volume = volume;
}
