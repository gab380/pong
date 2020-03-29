let canvas;
let ctx;

let DIRECTION = {
  STOPPED: 0,
  UP: 1,
  DOWN: 2,
  RIGHT: 3,
  LEFT: 4
};

class Paddle {
  constructor(side, speed) {
    this.width = 15;
    this.height = 60;
    this.x = side === 'left' ? 50 : canvas.width - 50;
    this.y = canvas.height / 2 - 30;
    this.score = 0;
    this.move = DIRECTION.STOPPED;
    this.speed = speed;
  }
}

class Ball {
  constructor(newSpeed) {
    this.width = 15;
    this.height = 15;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.moveX = DIRECTION.STOPPED;
    this.moveY = DIRECTION.STOPPED;
    this.speed = newSpeed;
  }
}

let player;
let aiPlayer;
let ball;
let running = false;
let gameOver = false;
let delayAmount;
let targetForBall;
let beepSound;

document.addEventListener('DOMContentLoaded', setupCanvas);

// Setup Canvas
function setupCanvas() {
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 300;
  player = new Paddle('left', 11);
  aiPlayer = new Paddle('right', 1);
  ball = new Ball(2);
  targetForBall = player;
  delayAmount = new Date().getTime();
  beepSound = document.getElementById('beep-sound');
  beepSound.src = '../assets/beep.wav';
  document.addEventListener('keydown', movePlayerPaddle);
  document.addEventListener('keyup', stopPlayerPaddle);
  canvas.addEventListener('touchstart', movePlayerPaddle);
  canvas.addEventListener('touchmove', movePlayerPaddle);
  canvas.addEventListener('touchend', stopPlayerPaddle);
  draw();
}

// Draw
function draw() {
  // Clear game area
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw game area
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  // Draw player
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Draw aiPlayer
  ctx.fillRect(aiPlayer.x, aiPlayer.y, aiPlayer.width, aiPlayer.height);
  // Draw ball
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
  ctx.fillRect(canvas.width / 2 + 7, 0, 1, canvas.height);

  // Draw player score
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(player.score.toString(), canvas.width / 2 - 150, 50);
  ctx.fillText(aiPlayer.score.toString(), canvas.width / 2 + 150, 50);

  if (player.score === 15) {
    ctx.fillText('Player Wins!', canvas.width / 2, 100);
    gameOver = true;
  }

  if (aiPlayer.score === 15) {
    ctx.fillText('AI Wins :c', canvas.width / 2, 100);
    gameOver = true;
  }
}

// Update Canvas
function update() {
  if (!gameOver) {
    if (ball.x <= 0) {
      resetBall(aiPlayer, player);
    }

    if (ball.x >= canvas.width - ball.width) {
      resetBall(player, aiPlayer);
    }

    if (ball.y <= 0) {
      ball.moveY = DIRECTION.DOWN;
    }

    if (ball.y >= canvas.height - ball.height) {
      ball.moveY = DIRECTION.UP;
    }

    if (player.move === DIRECTION.DOWN) {
      player.y += player.speed;
    } else if (player.move === DIRECTION.UP) {
      player.y -= player.speed;
    }

    if (player.y < 0) {
      player.y = 0;
    } else if (player.y >= canvas.height - player.height) {
      player.y = canvas.height - player.height;
    }

    if (addADelay() && targetForBall) {
      ball.moveX = targetForBall === player ? DIRECTION.LEFT : DIRECTION.RIGHT;
      ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
      ball.y = canvas.height / 2;
      targetForBall = null;
    }

    if (ball.moveY === DIRECTION.UP) {
      ball.y -= ball.speed;
    } else if (ball.moveY === DIRECTION.DOWN) {
      ball.y += ball.speed;
    }

    if (ball.moveX === DIRECTION.LEFT) {
      ball.x -= ball.speed;
    } else if (ball.moveX === DIRECTION.RIGHT) {
      ball.x += ball.speed;
    }

    if (aiPlayer.y > ball.y - aiPlayer.height / 2) {
      if (ball.moveX === DIRECTION.RIGHT) {
        aiPlayer.y -= aiPlayer.speed;
      }
    }

    if (aiPlayer.y < ball.y - aiPlayer.height / 2) {
      if (ball.moveX === DIRECTION.RIGHT) {
        aiPlayer.y += aiPlayer.speed;
      }
    }

    if (aiPlayer.y < 0) {
      aiPlayer.y = 0;
    } else if (aiPlayer.y >= canvas.height - aiPlayer.height) {
      aiPlayer.y = canvas.height - aiPlayer.height;
    }

    if (ball.x - ball.width <= player.x && ball.x >= player.x - player.width) {
      if (
        ball.y <= player.y + player.height &&
        ball.y + ball.height >= player.y
      ) {
        ball.moveX = DIRECTION.RIGHT;
        let promise = beepSound.play();

        if (promise !== undefined) {
          promise
            .then((_) => {
              // Autoplay started!
            })
            .catch((error) => {
              // Autoplay was prevented.
              // Show a "Play" button so that user can start playback.
            });
        }
      }
    }

    if (
      ball.x - ball.width <= aiPlayer.x &&
      ball.x >= aiPlayer.x - aiPlayer.width
    ) {
      if (
        ball.y <= aiPlayer.y + aiPlayer.height &&
        ball.y + ball.height >= aiPlayer.y
      ) {
        ball.moveX = DIRECTION.LEFT;
        let promise = beepSound.play();

        if (promise !== undefined) {
          promise
            .then((_) => {
              // Autoplay started!
            })
            .catch((error) => {
              // Autoplay was prevented.
              // Show a "Play" button so that user can start playback.
            });
        }
      }
    }
  }
}

// Move Player Paddle
function movePlayerPaddle(e) {
  if (running === false) {
    running = true;
    window.requestAnimationFrame(gameLoop);
  }

  if (e.targetTouches !== undefined) {
    player.y = e.targetTouches[0].pageY - 300;
  } else {
    if (e.keyCode === 38 || e.keyCode === 87) player.move = DIRECTION.UP;
    if (e.keyCode === 40 || e.keyCode === 83) player.move = DIRECTION.DOWN;
  }
  // console.log(e);
  // console.log(`Player y: ${player.y}`);
  // console.log(`Touch y: ${e.targetTouches[0].pageY}`);
}

// Stop Player Paddle
function stopPlayerPaddle(evt) {
  player.move = DIRECTION.STOPPED;
}

// Game Loop
function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

// Reset Ball
function resetBall(whoScored, whoLost) {
  whoScored.score++;
  const newBallSpeed = ball.speed + 0.2;
  aiPlayer.speed += 0.2;
  ball = new Ball(newBallSpeed);
  targetForBall = player;
  delayAmount = new Date().getTime();
}

// Add a Delay
function addADelay() {
  return new Date().getTime() - delayAmount >= 1000;
}
