const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Bird properties
let bird = {
    x: 50,
    y: 300,
    width: 70,
    height: 60,
    gravity: 0.3,
    lift: -6,
    velocity:0
};

// Variables for pipe and game settings
let pipes = [];
let score = 0;
let isGameOver = false;
let isGameStarted = false;
let pipeSpeed = 5; // Initial pipe speed
const pipeGap = 150;
let isDay = true; // Day and night cycle tracker
let startTime; // To track game start time

// Day Background Images
const dayBackgrounds = [
    'https://i.postimg.cc/RVhg9xyd/back-ground-7.avif',
    'https://i.postimg.cc/SsVGFgGH/background-6.avif',
    'https://i.postimg.cc/fTVfpjSg/fbackground5.avif'
];

// Night Background Images
const nightBackgrounds = [
    'https://i.postimg.cc/9f5bGRMg/backgroud-2.avif',
    'https://i.postimg.cc/JhNqKrHr/background-3.avif',
    'https://i.postimg.cc/Kzm5H6tn/background-4.avif'
];

// Previous Bird Image
const birdImg = new Image();
birdImg.src = 'https://i.postimg.cc/DwFJmP89/bird-removebg-preview.png';

// Pipe Images: Different for Day and Night
const dayPipeImg = new Image();
dayPipeImg.src = 'https://i.postimg.cc/4NpHJSNv/pipe-removebg-preview.png'; // Cloud image for day pipes
const nightPipeImg = new Image();
nightPipeImg.src = 'https://i.postimg.cc/RZNmshT1/pipe-2-removebg-preview.png'; // Cloud image for night pipes

// Set initial background
let backgroundImg = new Image();
backgroundImg.src = dayBackgrounds[Math.floor(Math.random() * dayBackgrounds.length)];

// Start and restart buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Switch between day and night backgrounds
function switchDayNight() {
    isDay = !isDay;
    backgroundImg.src = isDay
        ? dayBackgrounds[Math.floor(Math.random() * dayBackgrounds.length)]
        : nightBackgrounds[Math.floor(Math.random() * nightBackgrounds.length)];
}

// Set an interval to switch day and night every 60 seconds
setInterval(switchDayNight, 60000);

// Increase pipe speed every 5 minutes
function increasePipeSpeed() {
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - startTime) / 60000; // Convert milliseconds to minutes
    const newSpeed = 2 + Math.floor(elapsedMinutes / 1); // Increase speed every 5 minutes
    pipeSpeed = Math.min(newSpeed, 10); // Cap the maximum speed to avoid excessive difficulty
}

// Start the game
function startGame() {
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    resizeCanvas();
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    isGameOver = false;
    isGameStarted = true;
    startTime = Date.now(); // Initialize start time
    generateInitialPipes(); // Generate initial set of pipes immediately
    gameLoop();
}

// Restart the game
function restartGame() {
    startGame();
}

// Main game loop
function gameLoop() {
    if (isGameOver) {
        displayGameOver();
        return;
    }

    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Collision detection
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        isGameOver = true;
    }

    // Increase pipe speed based on elapsed time
    increasePipeSpeed();

    // Pipe logic
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        if (isBirdCollidingWithPipe(bird, pipe)) {
            isGameOver = true;
        }

        if (pipe.x + pipe.width <= 0) {
            pipes.splice(index, 1);
            generatePipes(); // Generate new pipes
            score++;
        }
    });
}

// Generate initial set of pipes
function generateInitialPipes() {
    const pipeWidth = canvas.width * 0.1;
    const numberOfPipes = 4; // Number of pipe pairs to generate
    const spacing = canvas.width / (numberOfPipes + 1) * 2; // Double the space between pipe pairs

    for (let i = 0; i < numberOfPipes; i++) {
        const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap)) + 50;
        const bottomY = topHeight + pipeGap;

        pipes.push({
            x: canvas.width + (i * spacing), // Adjust initial position to remove delay
            width: pipeWidth,
            topHeight: topHeight,
            bottomY: bottomY,
            bottomHeight: canvas.height - bottomY
        });
    }
}

// Generate new pipes as needed
function generatePipes() {
    const pipeWidth = canvas.width * 0.1;
    const spacing = canvas.width / (4 + 1) * 2; // Same spacing as initial

    const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap)) + 50;
    const bottomY = topHeight + pipeGap;

    pipes.push({
        x: canvas.width + spacing,
        width: pipeWidth,
        topHeight: topHeight,
        bottomY: bottomY,
        bottomHeight: canvas.height - bottomY
    });
}

// Updated collision detection function with further refinements
function isBirdCollidingWithPipe(bird, pipe) {
    const birdLeft = bird.x + 10; // Further adjust for potential transparent areas
    const birdRight = bird.x + bird.width - 10;
    const birdTop = bird.y + 10;
    const birdBottom = bird.y + bird.height - 10;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    const pipeTop = pipe.topHeight;
    const pipeBottom = pipe.bottomY;

    // Check if the bird is within the pipe's horizontal range
    const isInPipeXRange = birdRight > pipeLeft && birdLeft < pipeRight;

    // Check if the bird is colliding with the top or bottom pipe
    const isHittingTopPipe = birdTop < pipeTop;
    const isHittingBottomPipe = birdBottom > pipeBottom;

    // Debugging: Draw hitboxes to visually verify the collision areas
    ctx.strokeStyle = 'red'; // Bird's hitbox in red
    ctx.strokeRect(birdLeft, birdTop, birdRight - birdLeft, birdBottom - birdTop);

    ctx.strokeStyle = 'blue'; // Pipe's hitbox in blue
    ctx.strokeRect(pipeLeft, 0, pipe.width, pipeTop); // Top pipe hitbox
    ctx.strokeRect(pipeLeft, pipe.bottomY, pipe.width, pipe.bottomHeight); // Bottom pipe hitbox

    // Return true if the bird collides with either the top or bottom pipe
    return isInPipeXRange && (isHittingTopPipe || isHittingBottomPipe);
}

// Draw the game elements
function drawGame() {
    // Draw the background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Choose pipe color based on day/night
    const pipeImg = isDay ? dayPipeImg : nightPipeImg;

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.drawImage(pipeImg, pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
    });

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Make the bird fly (flap)
function flyBird() {
    if (!isGameOver && isGameStarted) {
        bird.velocity = bird.lift;
    }
}

// Add event listeners for touch and mouse
function setupControls() {
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        flyBird();
    }, { passive: false });

    canvas.addEventListener('mousedown', function() {
        flyBird();
    });
}

setupControls(); // Initialize controls

// Display game over message
function displayGameOver() {
    ctx.fillStyle = '#000';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

    restartBtn.style.display = 'block'; // Show restart button
}
