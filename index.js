const canvas = document.getElementById("canvascls");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const startDiv = document.querySelector(".divmainstart");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let gameRunning = false;

const playerImg = new Image();
playerImg.src = "game-images/player.png";

const enemyImg = new Image();
enemyImg.src = "game-images/enemy.png";

const fireImg = new Image();
fireImg.src = "game-images/fire.png";

const fireSound = new Audio("game-audio/fire.mp3");
const downSound = new Audio("game-audio/down.mp3");

function playSound(audio) {
  const soundClone = audio.cloneNode();
  soundClone.play();
}

const mountainImg = new Image();
mountainImg.src = "game-images/mountain.png";
let mountainLoaded = false;
mountainImg.onload = () => {
  mountainLoaded = true;
};

const stonesImg = new Image();
stonesImg.src = "game-images/stones.png";
let stonesLoaded = false;
stonesImg.onload = () => {
  stonesLoaded = true;
};

let mountainOffset = 0;
const mountainImgWidth = 600;
const mountainImgHeight = 200;

let stonesOffset = 0;
const stonesImgWidth = 400;
const stonesImgHeight = 800;

const fireWidth = 60;
const fireHeight = 20;

let player = {
  x: 40,
  y: 200,
  width: 150,
  height: 80,
};

let enemy = {
  x: 0,
  y: 0,
  width: 150,
  height: 80,
  active: false,
};

let bullets = [];
let score = 0;

let enemyTimer = 0;
let enemyDuration = 6000;
let nextEnemySpawnTime = 0;
let enemySpawnDelay = 0;

const keys = {};

let lastShot = 0;
let shootDelay = 100;

startBtn.onclick = () => {
  startDiv.style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  gameLoop();
};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (stonesLoaded) {
    let x = stonesOffset;
    while (x < canvas.width + stonesImgWidth) {
      let y = 0;
      while (y < canvas.height) {
        ctx.drawImage(stonesImg, x, y, stonesImgWidth, stonesImgHeight);
        y += stonesImgHeight;
      }
      x += stonesImgWidth;
    }
    stonesOffset -= 0.5;
    if (stonesOffset < -stonesImgWidth) stonesOffset = 0;
  }

  if (mountainLoaded) {
    let x = mountainOffset;
    while (x < canvas.width + mountainImgWidth) {
      ctx.drawImage(mountainImg, x, 0, mountainImgWidth, mountainImgHeight);
      x += mountainImgWidth;
    }
    mountainOffset -= 1;
    if (mountainOffset < -mountainImgWidth) mountainOffset = 0;
  }

  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  let text = "Score: " + score;
  ctx.fillText(text, (canvas.width - ctx.measureText(text).width) / 2, 35);

  if (keys["ArrowUp"] || keys["W"] || keys["w"]) {
    player.y = Math.max(mountainImgHeight, player.y - 6);
  }
  if (keys["ArrowDown"] || keys["S"] || keys["s"]) {
    player.y = Math.min(canvas.height - player.height, player.y + 6);
  }
  if (keys["Enter"]) {
    let now = Date.now();
    if (now - lastShot >= shootDelay) {
      bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 });
      playSound(fireSound);
      lastShot = now;
    }
  }

  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  if (!enemy.active) {
    if (Date.now() >= nextEnemySpawnTime) {
      enemy.x = Math.random() * (canvas.width / 2 - enemy.width) + (canvas.width / 2);
      enemy.y = Math.random() * (canvas.height - enemy.height - mountainImgHeight) + mountainImgHeight;
      enemy.active = true;
      enemyTimer = Date.now();
      nextEnemySpawnTime = Date.now() + Math.random() * 2000 + 1000;
    }
  } else {
    if (Date.now() - enemyTimer > enemyDuration) {
      enemy.active = false;
    }
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
  }

  bullets.forEach((bullet, int) => {
    bullet.x += 10;
    ctx.save();
    ctx.translate(bullet.x + fireWidth / 2, bullet.y + fireHeight / 2);
    ctx.drawImage(fireImg, -fireWidth / 2, -fireHeight / 2, fireWidth, fireHeight);
    ctx.restore();

    if (enemy.active &&
      bullet.x < enemy.x + enemy.width &&
      bullet.x + fireWidth > enemy.x &&
      bullet.y < enemy.y + enemy.height &&
      bullet.y + fireHeight > enemy.y) {
      enemy.active = false;
      playSound(downSound);
      score += 10;
      bullets.splice(int, 1);
    }
  });

  requestAnimationFrame(gameLoop);
}
