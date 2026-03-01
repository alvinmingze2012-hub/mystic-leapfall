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

// Player Object
let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
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

// Platforms
let platforms = [
    { x: 0, y: 350, width: 200, height: 20 },
    { x: 250, y: 300, width: 150, height: 20 },
    { x: 450, y: 250, width: 150, height: 20 },
    { x: 650, y: 200, width: 150, height: 20 }
];

// Collectibles
let collectibles = [
    { x: 150, y: 320, width: 20, height: 20, collected: false, type: 'coin' },
    { x: 350, y: 270, width: 20, height: 20, collected: false, type: 'coin' },
    { x: 550, y: 220, width: 20, height: 20, collected: false, type: 'powerup' }
];

// Enemies
let enemies = [
    { x: 300, y: 280, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
    { x: 500, y: 230, width: 25, height: 25, speed: 3, direction: 1, type: 'jumper' }
];

// Keys Pressed
let keys = {
    left: false,
    right: false,
    space: false,
    shift: false,
    q: false
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
    
    // Start with main menu
    showMainMenu();
});

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
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
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
    switch(level) {
        case 1: // Enchanted Forest
            platforms = [
                { x: 0, y: 350, width: 200, height: 20 },
                { x: 250, y: 300, width: 150, height: 20 },
                { x: 450, y: 250, width: 150, height: 20 },
                { x: 650, y: 200, width: 150, height: 20 },
                { x: 750, y: 150, width: 50, height: 20 }
            ];
            collectibles = [
                { x: 150, y: 320, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 350, y: 270, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 550, y: 220, width: 20, height: 20, collected: false, type: 'powerup' },
                { x: 700, y: 120, width: 20, height: 20, collected: false, type: 'shield' }
            ];
            enemies = [
                { x: 300, y: 280, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
                { x: 500, y: 230, width: 25, height: 25, speed: 3, direction: 1, type: 'jumper' }
            ];
            document.getElementById('levelNameDisplay').textContent = 'Enchanted Forest';
            break;
            
        case 2: // Crystal Caverns
            platforms = [
                { x: 0, y: 350, width: 150, height: 20 },
                { x: 200, y: 300, width: 100, height: 20 },
                { x: 350, y: 250, width: 100, height: 20 },
                { x: 500, y: 200, width: 100, height: 20 },
                { x: 650, y: 250, width: 100, height: 20 },
                { x: 700, y: 300, width: 100, height: 20 }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 250, y: 270, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 400, y: 220, width: 20, height: 20, collected: false, type: 'powerup' },
                { x: 550, y: 170, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 700, y: 220, width: 20, height: 20, collected: false, type: 'doublejump' }
            ];
            enemies = [
                { x: 250, y: 280, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
                { x: 400, y: 230, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
                { x: 600, y: 280, width: 25, height: 25, speed: 3, direction: 1, type: 'jumper' }
            ];
            document.getElementById('levelNameDisplay').textContent = 'Crystal Caverns';
            break;
            
        case 3: // Sky Fortress
            platforms = [
                { x: 0, y: 350, width: 100, height: 20 },
                { x: 150, y: 300, width: 80, height: 20 },
                { x: 280, y: 250, width: 80, height: 20 },
                { x: 410, y: 200, width: 80, height: 20 },
                { x: 540, y: 150, width: 80, height: 20 },
                { x: 670, y: 200, width: 80, height: 20 },
                { x: 750, y: 250, width: 50, height: 20 }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 190, y: 270, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 320, y: 220, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 450, y: 170, width: 20, height: 20, collected: false, type: 'powerup' },
                { x: 580, y: 120, width: 20, height: 20, collected: false, type: 'shield' },
                { x: 710, y: 170, width: 20, height: 20, collected: false, type: 'doublejump' }
            ];
            enemies = [
                { x: 200, y: 280, width: 25, height: 25, speed: 3, direction: 1, type: 'walker' },
                { x: 330, y: 230, width: 25, height: 25, speed: 2, direction: 1, type: 'flyer' },
                { x: 460, y: 180, width: 25, height: 25, speed: 4, direction: 1, type: 'flyer' }
            ];
            document.getElementById('levelNameDisplay').textContent = 'Sky Fortress';
            break;
            
        case 4: // Lava Depths
            platforms = [
                { x: 0, y: 350, width: 120, height: 20 },
                { x: 170, y: 300, width: 100, height: 20 },
                { x: 320, y: 250, width: 100, height: 20 },
                { x: 470, y: 200, width: 100, height: 20 },
                { x: 620, y: 250, width: 100, height: 20 },
                { x: 720, y: 300, width: 80, height: 20 }
            ];
            collectibles = [
                { x: 50, y: 320, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 220, y: 270, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 370, y: 220, width: 20, height: 20, collected: false, type: 'coin' },
                { x: 520, y: 170, width: 20, height: 20, collected: false, type: 'powerup' },
                { x: 670, y: 220, width: 20, height: 20, collected: false, type: 'shield' }
            ];
            enemies = [
                { x: 100, y: 330, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
                { x: 270, y: 280, width: 25, height: 25, speed: 3, direction: 1, type: 'jumper' },
                { x: 420, y: 230, width: 25, height: 25, speed: 2, direction: 1, type: 'walker' },
                { x: 570, y: 280, width: 25, height: 25, speed: 4, direction: 1, type: 'flyer' }
            ];
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
        // Game completed
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
    // Apply gravity
    player.velocityY += player.gravity;
    
    // Horizontal movement
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
    for (let enemy of enemies) {
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
            } else {
                // Enemy hit player
                takeDamage();
            }
        }
        
        // Move enemies
        if (enemy.type === 'walker') {
            enemy.x += enemy.speed * enemy.direction;
            if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
                enemy.direction *= -1;
            }
        } else if (enemy.type === 'jumper') {
            enemy.y += Math.sin(Date.now() * 0.01) * 2;
        } else if (enemy.type === 'flyer') {
            enemy.x += enemy.speed * enemy.direction;
            enemy.y += Math.sin(Date.now() * 0.02) * 3;
            if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
                enemy.direction *= -1;
            }
        }
    }
    
    // Collect items
    for (let item of collectibles) {
        if (!item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            item.collected = true;
            score += 50;
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
    
    // Check if player fell off
    if (player.y > canvas.height) {
        takeDamage();
        player.x = 100;
        player.y = 300;
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

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (parallax effect)
    ctx.fillStyle = getBackgroundColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw platforms
    ctx.fillStyle = '#8B4513';
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add platform details
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(platform.x, platform.y - 2, platform.width, 2);
        ctx.fillStyle = '#8B4513';
    }
    
    // Draw collectibles
    for (let item of collectibles) {
        if (!item.collected) {
            if (item.type === 'coin') {
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = item.type === 'powerup' ? 'purple' : 
                               item.type === 'doublejump' ? 'cyan' : 'blue';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                
                // Glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = item.type === 'powerup' ? 'purple' : 
                                 item.type === 'doublejump' ? 'cyan' : 'blue';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // Draw enemies
    for (let enemy of enemies) {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 15, enemy.y + 5, 5, 5);
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 7, enemy.y + 7, 3, 3);
        ctx.fillRect(enemy.x + 17, enemy.y + 7, 3, 3);
    }
    
    // Draw player
    ctx.fillStyle = player.invincible ? 'yellow' : 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player details
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
    ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 7, player.y + 7, 3, 3);
    ctx.fillRect(player.x + 22, player.y + 7, 3, 3);
    
    // Player cape if has powerups
    if (powerups.doubleJump || powerups.dash || powerups.shield) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width, player.y);
        ctx.lineTo(player.x + player.width + 20, player.y + player.height/2);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.fill();
    }
    
    // Draw particles if invincible
    if (player.invincible) {
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.5})`;
            ctx.fillRect(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                2, 2
            );
        }
    }
}

// Helper Functions
function getBackgroundColor() {
    switch(currentLevel) {
        case 1: return '#87CEEB'; // Sky blue for forest
        case 2: return '#4A148C'; // Deep purple for caverns
        case 3: return '#87CEEB'; // Sky blue for sky fortress
        case 4: return '#8B0000'; // Dark red for lava
        default: return '#87CEEB';
    }
}

function takeDamage() {
    if (player.invincible) return;
    
    if (player.hasShield) {
        player.hasShield = false;
        player.invincible = true;
        player.invincibilityTimer = 60; // 1 second at 60fps
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
        player.invincibilityTimer = 300; // 5 seconds
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
    
    // Calculate final stats
    let collectiblesCount = collectibles.filter(c => c.collected).length;
    let totalCollectibles = collectibles.length;
    
    document.getElementById('levelScore').textContent = `Score: ${score}`;
    document.getElementById('levelTime').textContent = `Time: ${document.getElementById('timerDisplay').textContent}`;
    document.getElementById('collectiblesFound').textContent = `Collectibles: ${collectiblesCount}/${totalCollectibles}`;
    
    document.getElementById('levelComplete').classList.remove('hidden');
    
    // Bonus for collectibles
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
        sound.play().catch(e => {
            // Silently ignore - audio files not found
        });
    }
}

function updateSFXVolume(e) {
    let volume = e.target.value / 100;
    document.getElementById('sfxValue').textContent = e.target.value + '%';
    // Update all sound effects volume
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
