
// sounds
const sounds = {
    background: new Howl({
        src: ['assets/sounds/game_loop_1.mp3'],
        loop: true,
        volume: 0.1,
        transition: 0.5
    }),
    correct: new Howl({
        src: ['assets/sounds/correct.mp3'],
        volume: 0.1
    }),
    incorrect: new Howl({
        src: ['assets/sounds/wrong.mp3'],
        volume: 0.6
    }),
    levelUp: new Howl({
        src: ['assets/sounds/level_up.mp3']
    }),
    gameOver: new Howl({
        src: ['assets/sounds/game_over.mp3']
    })
};

let playerName = "";
let app;
let score = 0;
let level = 1;
let lives = 3;
let actualCount = 0;

const welcomeScreen = document.getElementById('welcome-screen');
const startGameButton = document.getElementById('start-game');
const playerNameInput = document.getElementById('player-name');
const gameOverScreen = document.getElementById('game-over-screen');
const retryButton = document.getElementById('retry-button');
const startOverButton = document.getElementById('start-over-button');
const gameContainer = document.getElementById('game-container');

startGameButton.addEventListener('click', startGame);
retryButton.addEventListener('click', retryGame);
startOverButton.addEventListener('click', startOver);

function startGame() {
    playerName = playerNameInput.value.trim() || "Player";
    welcomeScreen.style.display = 'none';
    if (!app) {
        initializeGame();
    } else {
        resetGame();
    }
}

function initializeGame() {
    app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight * 0.6,
        backgroundColor: 0x1099bb
    });
    gameContainer.appendChild(app.view);
    
    const backgroundTexture = PIXI.Texture.from('assets/images/bg game dreametrix2.png');
    const background = new PIXI.TilingSprite(backgroundTexture, app.screen.width, app.screen.height);
    app.stage.addChild(background);

    sounds.background.play();
    resetGame();
}

const images = [
    'assets/images/slice4.png',
    'assets/images/slice5.png',
    'assets/images/slice6.png',
    'assets/images/slice8.png',
    'assets/images/slice9.png',
    'assets/images/slice10.png',
    'assets/images/slice11.png',
    'assets/images/slice12.png',
    'assets/images/slice13.png',
    'assets/images/slice14.png',
    'assets/images/slice15.png',
    'assets/images/slice16.png',
    'assets/images/slice17.png',
    'assets/images/slice18.png',
    'assets/images/slice19.png',
    'assets/images/slice20.png',
    'assets/images/slice21.png',
    'assets/images/slice22.png',
    'assets/images/slice23.png',
];

let targetShapeImage;
let targetCount;

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const livesElement = document.getElementById('lives');
const targetShapeElement = document.getElementById('target-shape');
const targetCountElement = document.getElementById('target-count');

function setNewTarget() {
    targetShapeImage = images[Math.floor(Math.random() * images.length)];
    targetCount = Math.floor(Math.random() * 3) + 1; // Random count between 1 and 5
    targetShapeElement.innerHTML = `<img src="${targetShapeImage}" width="50">`;
    targetCountElement.textContent = targetCount;
}

function generateShapes() {
    app.stage.removeChildren();
    const backgroundTexture = PIXI.Texture.from('assets/images/bg game dreametrix2.png');
    const background = new PIXI.TilingSprite(backgroundTexture, app.screen.width, app.screen.height);
    app.stage.addChild(background);

    let shapeCount = Math.floor(Math.random() * 10) + 5 + (level - 1) * 2; // Increase shape count with level
    actualCount = 0;
    let placedShapes = [];

    for (let i = 0; i < shapeCount; i++) {
        const randomIndex = Math.floor(Math.random() * images.length);
        const selectedImage = images[randomIndex];
        const texture = PIXI.Texture.from(selectedImage);
        const sprite = new PIXI.Sprite(texture);

        sprite.width = 100;
        sprite.height = 100;
        sprite.anchor.set(0.5);

        let attempts = 0;
        let validPosition = false;

        while (!validPosition && attempts < 100) {
            sprite.x = Math.random() * (app.screen.width - sprite.width) + sprite.width / 2;
            sprite.y = Math.random() * (app.screen.height - sprite.height) + sprite.height / 2;

            validPosition = !placedShapes.some(shape => 
                rectanglesOverlap(sprite, shape)
            );

            attempts++;
        }

        if (validPosition) {
            app.stage.addChild(sprite);
            placedShapes.push(sprite);

            if (selectedImage === targetShapeImage) {
                actualCount++;
            }

            if (level >= 1) { // usless at this point
                gsap.to(sprite, {
                    rotation: Math.PI * 2,
                    duration: 5 + Math.random() * 5, // Random duration between 5-10 seconds
                    repeat: -1,
                    ease: "none"
                });
            }
        }
    }

    return actualCount;
}

function rectanglesOverlap(rect1, rect2) {
    const dx = rect1.x - rect2.x;
    const dy = rect1.y - rect2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (rect1.width + rect2.width) / 2;
}

function handleAnswer(isCorrect) {
    if (isCorrect) {
        score++;
        sounds.correct.play();
        showCorrectAnimation();
        if (score % 10 === 0) {
            level++;
            showLevelUpAnimation();
            sounds.levelUp.play();
        
        }
    } else {
        lives--;
        showIncorrectAnimation();
        sounds.incorrect.play();
    }

    updateGameState();
}

function showCorrectAnimation() {
    const text = new PIXI.Text('Correct!', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0x00FF00,
        align: 'center',
    });
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    text.anchor.set(0.5);

    app.stage.addChild(text);

    gsap.to(text.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            app.stage.removeChild(text);
        }
    });
}

function showIncorrectAnimation() {
    const text = new PIXI.Text('Incorrect!', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xFF0000,
        align: 'center',
    });
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    text.anchor.set(0.5);

    app.stage.addChild(text);

    gsap.to(text, {
        alpha: 0,
        duration: 1,
        onComplete: () => {
            app.stage.removeChild(text);
        }
    });
}

function showLevelUpAnimation() {
    const text = new PIXI.Text('Level Up!', {
        fontFamily: 'Arial',
        fontSize: 64,
        fill: 0xFFD700,
        align: 'center',
    });
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 5;
    text.anchor.set(0.5);

    app.stage.addChild(text);

    gsap.to(text.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            app.stage.removeChild(text);
        }
    });
}

function updateGameState() {
    scoreElement.innerText = `${playerName}'s Score: ${score}`;
    levelElement.innerText = `Level ${level}`;
    livesElement.innerHTML = '❤️'.repeat(lives);

    if (lives > 0) {
        setTimeout(newRound, 1500); // Delay new round to allow animation to complete
    } else {
        endGame();
    }
}

function endGame() {
    sounds.background.stop();
    sounds.gameOver.play();

    // Update the game over screen
    document.getElementById('final-player-name').textContent = playerName;
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-level').textContent = level;
    
    // Show the game over screen
    gameOverScreen.style.display = 'flex';
}

function retryGame() {
    gameOverScreen.style.display = 'none';
    resetGame();
}

function startOver() {
    gameOverScreen.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    playerNameInput.value = '';
    sounds.background.stop();
}

function resetGame() {
    score = 0;
    level = 1;
    lives = 3;
    sounds.background.play();
    updateGameState();
    newRound();
}

document.getElementById('trueBtn').onclick = () => handleAnswer(actualCount === targetCount);
document.getElementById('falseBtn').onclick = () => handleAnswer(actualCount !== targetCount);

function newRound() {
    setNewTarget();
    generateShapes();
}