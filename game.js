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

// Level spawn points - each level spawns on a platform
let spawnPoints = {
    1: { x: 120, y: 330 }, // Spawn on first platform
    2: { x: 120, y: 330 }, // Spawn on first platform
    3: { x: 30, y: 330 },  // Spawn on first cloud platform
    4: { x: 30, y: 330 }   // Spawn on first stone platform
};

// Level completion status for checkmarks
let levelCompleted = {
    1: false,
    2: false,
    3: false,
    4: false
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
    
    // Level selection cards
    setupLevelSelection();
    
    // Start with main menu
    showMainMenu();
});

// Setup level selection cards with checkmarks
function setupLevelSelection() {
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach((card, index) => {
        const levelNum = index + 1;
        
        // Add click handler
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            levelCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Load the level
            loadLevel(levelNum);
        });
        
        // Add checkmark element if not exists
        if (!card.querySelector('.checkmark')) {
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.innerHTML = '✓';
            checkmark.style.display = 'none';
            card.appendChild(checkmark);
        }
    });
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

// Menu Navigation Functions
function showMainMenu() {
    document.getElementById('mainMenu').classList.add('active');
    document.getElementById('levelSelect').classList.remove('active');
    document.getElementById('instructions').classList.remove('active');
    document.getElementById('settings').classList.remove('active');
    document.getElementById('gameScreen').classList.add('hidden');
    
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
    updateLevelCheckmarks(); // Update checkmarks when showing level select
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
    loadLevel(1);
}

function loadLevel(level) {
    currentLevel = level;
    resetGame();
    loadLevelData(level);
    startGameLoop();
}

function resetGame() {
    // Reset player speed to 5 (FIXED)
    player.speed = 5;
    
    // Reset player to spawn point (ON a platform)
    player.x = spawnPoints[currentLevel].x;
    player.y = spawnPoints[currentLevel].y;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = true; // Start grounded
    player.canDoubleJump = true;
    player.invincible = false;
    player.hasShield = false;
    
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

function loadLevelData(level) {
    // Reset arrays
    platforms = [];
    collectibles = [];
    enemies = [];
    
    switch(level) {
        case 1: // Enchanted Forest
            platforms = [
                { x: 0, y: 350, width: 200, height: 20, texture: 'grass' },
                { x: 250, y: 300, width: 150, height: 20, texture: 'grass' },
                { x: 450, y: 250, width: 150, height: 20, texture: 'grass' },
                { x: 650, y: 200, width: 150, height: 20, texture: 'grass' },
                { x: 750, y: 150, width: 50, height: 20, texture: 'grass' }
            ];
            collectibles = [
                { x: 150, y: 320, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 350, y: 270, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 550, y: 220, width: 20, height: 20, collected: false, type: 'powerup', value: 100 },
                { x: 700, y: 120, width: 20, height: 20, collected: false, type: 'shield', value: 150 }
            ];
            // Enemies placed ON platforms
            enemies = [
                { x: 300, y: 280, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 250, patrolEnd: 400, platformY: 300 }, // On second platform
                { x: 500, y: 230, width: 25, height: 25, speed: 0, direction: 1, type: 'stationary',
                  platformY: 250 } // Stationary on third platform
            ];
            spawnPoints[1] = { x: 120, y: 330 };
            document.getElementById('levelNameDisplay').textContent = 'Enchanted Forest';
            break;
            
        case 2: // Crystal Caverns
            platforms = [
                { x: 0, y: 350, width: 150, height: 20, texture: 'crystal' },
                { x: 200, y: 300, width: 100, height: 20, texture: 'crystal' },
                { x: 350, y: 250, width: 100, height: 20, texture: 'crystal' },
                { x: 500, y: 200, width: 100, height: 20, texture: 'crystal' },
                { x: 650, y: 250, width: 100, height: 20, texture: 'crystal' },
                { x: 700, y: 300, width: 100, height: 20, texture: 'crystal' }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 250, y: 270, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 400, y: 220, width: 20, height: 20, collected: false, type: 'powerup', value: 100 },
                { x: 550, y: 170, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 700, y: 220, width: 20, height: 20, collected: false, type: 'doublejump', value: 150 }
            ];
            // Enemies placed ON platforms
            enemies = [
                { x: 250, y: 280, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 200, patrolEnd: 300, platformY: 300 },
                { x: 400, y: 230, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 350, patrolEnd: 450, platformY: 250 },
                { x: 600, y: 230, width: 25, height: 25, speed: 0, direction: 1, type: 'stationary',
                  platformY: 250 }
            ];
            spawnPoints[2] = { x: 120, y: 330 };
            document.getElementById('levelNameDisplay').textContent = 'Crystal Caverns';
            break;
            
        case 3: // Sky Fortress
            platforms = [
                { x: 0, y: 350, width: 100, height: 20, texture: 'cloud' },
                { x: 120, y: 300, width: 80, height: 20, texture: 'cloud' },
                { x: 250, y: 250, width: 80, height: 20, texture: 'cloud' },
                { x: 380, y: 200, width: 80, height: 20, texture: 'cloud' },
                { x: 510, y: 150, width: 80, height: 20, texture: 'cloud' },
                { x: 640, y: 200, width: 80, height: 20, texture: 'cloud' },
                { x: 750, y: 250, width: 50, height: 20, texture: 'cloud' }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 160, y: 270, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 290, y: 220, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 420, y: 170, width: 20, height: 20, collected: false, type: 'powerup', value: 100 },
                { x: 550, y: 120, width: 20, height: 20, collected: false, type: 'shield', value: 150 },
                { x: 680, y: 170, width: 20, height: 20, collected: false, type: 'doublejump', value: 150 }
            ];
            // Enemies placed ON platforms - no flying enemies
            enemies = [
                { x: 180, y: 280, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 120, patrolEnd: 220, platformY: 300 },
                { x: 310, y: 230, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 250, patrolEnd: 330, platformY: 250 },
                { x: 440, y: 180, width: 25, height: 25, speed: 2, direction: 1, type: 'walker', 
                  patrolStart: 380, patrolEnd: 500, platformY: 200 }
            ];
            spawnPoints[3] = { x: 30, y: 330 };
            document.getElementById('levelNameDisplay').textContent = 'Sky Fortress';
            break;
            
        case 4: // Lava Depths
            platforms = [
                { x: 0, y: 350, width: 120, height: 20, texture: 'stone' },
                { x: 170, y: 300, width: 100, height: 20, texture: 'stone' },
                { x: 320, y: 250, width: 100, height: 20, texture: 'stone' },
                { x: 470, y: 200, width: 100, height: 20, texture: 'stone' },
                { x: 620, y: 250, width: 100, height: 20, texture: 'stone' },
                { x: 720, y: 300, width: 80, height: 20, texture: 'stone' }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 220, y: 270, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 370, y: 220, width: 20, height: 20, collected: false, type: 'coin', value: 50 },
                { x: 520, y: 170, width: 20, height: 20, collected: false, type: 'powerup', value: 100 },
                { x: 670, y: 220, width: 20, height: 20, collected: false, type: 'shield', value: 150 }
            ];
            // Enemies placed ON platforms
            enemies = [
                { x: 100, y: 330, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 50, patrolEnd: 150, platformY: 350 },
                { x: 270, y: 280, width: 25, height: 25, speed: 0, direction: 1, type: 'stationary',
                  platformY: 300 },
                { x: 420, y: 230, width: 25, height: 25, speed: 1.5, direction: 1, type: 'walker', 
                  patrolStart: 370, patrolEnd: 470, platformY: 250 },
                { x: 570, y: 230, width: 25, height: 25, speed: 2, direction: 1, type: 'walker', 
                  patrolStart: 520, patrolEnd: 620, platformY: 250 }
            ];
            spawnPoints[4] = { x: 30, y: 330 };
            document.getElementById('levelNameDisplay').textContent = 'Lava Depths';
            break;
    }
    
    // Reset collectibles collected state
    collectibles.forEach(c => c.collected = false);
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

function restartLevel() {
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    resetGame();
    loadLevelData(currentLevel);
}

function nextLevel() {
    if (currentLevel < 4) {
        loadLevel(currentLevel + 1);
    } else {
        // Game completed - show main menu
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
    // FIXED: Always keep speed at 5
    player.speed = 5;
    
    // Apply gravity
    player.velocityY += player.gravity;
    
    // Horizontal movement - fixed speed
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.7; // Friction
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
    
    // Enemy collision
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        
        if (!player.invincible &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
                // Player landed on enemy
                enemies.splice(i, 1);
                player.velocityY = player.jumpPower / 2;
                score += 100;
                updateHUD();
                playSound('powerupSound');
            } else {
                // Enemy hit player
                takeDamage();
            }
        }
        
        // Move enemies - they stay on their platform Y position
        if (enemy.type === 'walker') {
            enemy.x += enemy.speed * enemy.direction;
            // Keep enemy on its platform Y
            enemy.y = enemy.platformY - enemy.height;
            
            if (enemy.x <= enemy.patrolStart || enemy.x + enemy.width >= enemy.patrolEnd) {
                enemy.direction *= -1;
            }
        } else if (enemy.type === 'stationary') {
            // Stationary enemy - just sits there
            enemy.y = enemy.platformY - enemy.height;
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
    
    // Check for level completion (reaching end of level)
    if (player.x > canvas.width - 100) {
        completeLevel();
    }
    
    // Check if player fell off - respawn at spawn point and take damage
    if (player.y > canvas.height + 50) {
        takeDamage();
        player.x = spawnPoints[currentLevel].x;
        player.y = spawnPoints[currentLevel].y;
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

// Enhanced drawing with better graphics
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with gradient and details
    drawBackground();
    
    // Draw platforms with textures
    drawPlatforms();
    
    // Draw collectibles with animations
    drawCollectibles();
    
    // Draw enemies with details
    drawEnemies();
    
    // Draw player with animations
    drawPlayer();
    
    // Draw particles and effects
    drawEffects();
}

function drawBackground() {
    // Create gradient background
    let gradient;
    switch(currentLevel) {
        case 1: // Enchanted Forest
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#98D8E8');
            gradient.addColorStop(1, '#5F9EA0');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw trees
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 5; i++) {
                let x = (i * 150) % canvas.width;
                ctx.fillRect(x, 200, 10, 150);
                ctx.beginPath();
                ctx.arc(x + 5, 190, 20, 0, Math.PI * 2);
                ctx.fillStyle = '#32CD32';
                ctx.fill();
            }
            break;
            
        case 2: // Crystal Caverns
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4A148C');
            gradient.addColorStop(0.5, '#7B1FA2');
            gradient.addColorStop(1, '#311B92');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw crystals
            for (let i = 0; i < 8; i++) {
                let x = (i * 100) % canvas.width;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(Date.now() * 0.001 + i) * 0.05})`;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + 20, 50);
                ctx.lineTo(x - 20, 50);
                ctx.fill();
            }
            break;
            
        case 3: // Sky Fortress
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.3, '#B0E0E6');
            gradient.addColorStop(1, '#4682B4');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw clouds
            for (let i = 0; i < 3; i++) {
                let x = (i * 200 + Date.now() * 0.02) % (canvas.width + 200) - 100;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(x, 50, 30, 0, Math.PI * 2);
                ctx.arc(x + 40, 50, 25, 0, Math.PI * 2);
                ctx.arc(x + 20, 30, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 4: // Lava Depths
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(0.5, '#B22222');
            gradient.addColorStop(1, '#DC143C');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw lava bubbles
            for (let i = 0; i < 10; i++) {
                let x = (i * 80 + Date.now() * 0.01) % canvas.width;
                let y = canvas.height - 30 + Math.sin(Date.now() * 0.002 + i) * 10;
                ctx.fillStyle = `rgba(255, 140, 0, ${0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2})`;
                ctx.beginPath();
                ctx.arc(x, y, 5 + Math.sin(Date.now() * 0.001 + i) * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
    }
}

function drawPlatforms() {
    for (let platform of platforms) {
        // Platform base
        ctx.fillStyle = platform.texture === 'grass' ? '#8B4513' : 
                       platform.texture === 'crystal' ? '#4A148C' :
                       platform.texture === 'cloud' ? '#FFFFFF' : '#555555';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform top
        ctx.fillStyle = platform.texture === 'grass' ? '#32CD32' : 
                       platform.texture === 'crystal' ? '#E1BEE7' :
                       platform.texture === 'cloud' ? '#F0F8FF' : '#888888';
        ctx.fillRect(platform.x, platform.y - 3, platform.width, 5);
        
        // Platform edge highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(platform.x, platform.y - 2, platform.width, 2);
        
        // Platform bottom shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 3);
        
        // Add texture details
        if (platform.texture === 'grass') {
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = '#228B22';
                ctx.fillRect(platform.x + i * 40 + 10, platform.y - 8, 5, 8);
            }
        } else if (platform.texture === 'crystal') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < platform.width / 20; i++) {
                ctx.fillRect(platform.x + i * 20 + 5, platform.y - 2, 2, 5);
            }
        } else if (platform.texture === 'cloud') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(platform.x + i * 30 + 10, platform.y - 5, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawCollectibles() {
    for (let item of collectibles) {
        if (!item.collected) {
            let bounce = Math.sin(Date.now() * 0.005 + item.x) * 3;
            let y = item.y + bounce;
            
            if (item.type === 'coin') {
                // Animated coin
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'gold';
                
                // Coin body
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(item.x + item.width/2, y + item.height/2, item.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Coin shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(item.x + item.width/3, y + item.height/3, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Coin symbol
                ctx.fillStyle = '#B8860B';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⭐', item.x + item.width/2, y + item.height/2);
                
                ctx.restore();
                
            } else {
                // Powerup with glow
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = item.type === 'powerup' ? 'purple' : 
                                 item.type === 'doublejump' ? 'cyan' : 'blue';
                
                // Powerup body
                ctx.fillStyle = item.type === 'powerup' ? '#9C27B0' : 
                               item.type === 'doublejump' ? '#00BCD4' : '#2196F3';
                ctx.fillRect(item.x, y, item.width, item.height);
                
                // Powerup symbol
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let symbol = item.type === 'powerup' ? '✨' : 
                            item.type === 'doublejump' ? '🦶' : '🛡️';
                ctx.fillText(symbol, item.x + item.width/2, y + item.height/2);
                
                // Powerup glow pulse
                ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.005) * 5;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(item.x - 2, y - 2, item.width + 4, item.height + 4);
                
                ctx.restore();
            }
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
        
        // Enemy pupils (follow player)
        let pupilOffsetX = (player.x - enemy.x) * 0.02;
        pupilOffsetX = Math.max(-2, Math.min(2, pupilOffsetX));
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 6 + pupilOffsetX, enemy.y + 6, 3, 3);
        ctx.fillRect(enemy.x + 16 + pupilOffsetX, enemy.y + 6, 3, 3);
        
        // Enemy mouth/teeth
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(enemy.x + 10, enemy.y + 15, 2, 3);
        ctx.fillRect(enemy.x + 13, enemy.y + 15, 2, 3);
        
        // Enemy shadow on platform
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(enemy.x - 2, enemy.y + enemy.height, enemy.width + 4, 3);
    }
}

function drawPlayer() {
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(player.x - 5, player.y + player.height, player.width + 10, 5);
    
    // Player body with invincibility effect
    if (player.invincible) {
        ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(Date.now() * 0.02) * 0.3})`;
    } else {
        ctx.fillStyle = '#2196F3';
    }
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player cape if has powerups
    if (powerups.doubleJump || powerups.dash || powerups.shield || player.hasShield) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width, player.y);
        ctx.lineTo(player.x + player.width + 20, player.y + player.height/2);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.fill();
        
        // Cape sparkles
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(Date.now() * 0.01 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(player.x + player.width + 10, player.y + player.height/2 - 5 + i * 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Player eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
    
    // Player pupils (look in movement direction)
    let pupilOffset = 0;
    if (player.velocityX > 0) pupilOffset = 1;
    if (player.velocityX < 0) pupilOffset = -1;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 6 + pupilOffset, player.y + 6, 3, 3);
    ctx.fillRect(player.x + 21 + pupilOffset, player.y + 6, 3, 3);
    
    // Player hat
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
    
    // Mark level as completed
    levelCompleted[currentLevel] = true;
    
    let collectiblesCount = collectibles.filter(c => c.collected).length;
    let totalCollectibles = collectibles.length;
    
    document.getElementById('levelScore').textContent = `Score: ${score}`;
    document.getElementById('levelTime').textContent = `Time: ${document.getElementById('timerDisplay').textContent}`;
    document.getElementById('collectiblesFound').textContent = `Collectibles: ${collectiblesCount}/${totalCollectibles}`;
    
    document.getElementById('levelComplete').classList.remove('hidden');
    
    score += collectiblesCount * 100;
    updateHUD();
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    document.getElementById('finalTime').textContent = `Time: ${document.getElementById('timerDisplay').textContent}`;
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
