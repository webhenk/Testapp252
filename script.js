const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const world = {
  width: canvas.width,
  height: canvas.height,
};

const settings = {
  shipSpeed: 280,
  bulletSpeed: 560,
  bulletCooldownMs: 180,
  asteroidSpawnMs: 980,
  asteroidMinSpeed: 70,
  asteroidMaxSpeed: 155,
};

const keys = new Set();

const ship = {
  x: world.width * 0.5,
  y: world.height * 0.5,
  radius: 16,
  vx: 0,
  vy: 0,
};

let bullets = [];
let asteroids = [];
let lastFire = 0;
let lastSpawn = 0;
let score = 0;
let highScore = Number(localStorage.getItem("arcade-asteroids-highscore") || 0);
let gameOver = false;
let prevTime = performance.now();

function resetGame() {
  ship.x = world.width * 0.5;
  ship.y = world.height * 0.5;
  ship.vx = 0;
  ship.vy = 0;
  bullets = [];
  asteroids = [];
  score = 0;
  gameOver = false;
  prevTime = performance.now();
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function spawnAsteroid() {
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (side === 0) {
    x = randomRange(0, world.width);
    y = -24;
  } else if (side === 1) {
    x = world.width + 24;
    y = randomRange(0, world.height);
  } else if (side === 2) {
    x = randomRange(0, world.width);
    y = world.height + 24;
  } else {
    x = -24;
    y = randomRange(0, world.height);
  }

  const angleToShip = Math.atan2(ship.y - y, ship.x - x);
  const wobble = randomRange(-0.45, 0.45);
  const speed = randomRange(settings.asteroidMinSpeed, settings.asteroidMaxSpeed);
  const size = randomRange(18, 42);

  asteroids.push({
    x,
    y,
    radius: size,
    vx: Math.cos(angleToShip + wobble) * speed,
    vy: Math.sin(angleToShip + wobble) * speed,
    rotation: randomRange(0, Math.PI * 2),
    spin: randomRange(-1.2, 1.2),
  });
}

function updateShip(dt) {
  const left = keys.has("ArrowLeft");
  const right = keys.has("ArrowRight");
  const up = keys.has("ArrowUp");
  const down = keys.has("ArrowDown");

  const moveX = (right ? 1 : 0) - (left ? 1 : 0);
  const moveY = (down ? 1 : 0) - (up ? 1 : 0);
  const magnitude = Math.hypot(moveX, moveY) || 1;

  ship.vx = (moveX / magnitude) * settings.shipSpeed;
  ship.vy = (moveY / magnitude) * settings.shipSpeed;

  ship.x = Math.max(ship.radius, Math.min(world.width - ship.radius, ship.x + ship.vx * dt));
  ship.y = Math.max(ship.radius, Math.min(world.height - ship.radius, ship.y + ship.vy * dt));
}

function fireBullet(now) {
  if (now - lastFire < settings.bulletCooldownMs) {
    return;
  }

  lastFire = now;
  bullets.push({
    x: ship.x,
    y: ship.y - ship.radius,
    vx: 0,
    vy: -settings.bulletSpeed,
    radius: 4,
  });
}

function updateBullets(dt) {
  bullets = bullets.filter((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    return bullet.y > -20;
  });
}

function updateAsteroids(dt) {
  asteroids = asteroids.filter((asteroid) => {
    asteroid.x += asteroid.vx * dt;
    asteroid.y += asteroid.vy * dt;
    asteroid.rotation += asteroid.spin * dt;

    return (
      asteroid.x > -70 &&
      asteroid.x < world.width + 70 &&
      asteroid.y > -70 &&
      asteroid.y < world.height + 70
    );
  });
}

function checkCollisions() {
  for (let i = asteroids.length - 1; i >= 0; i -= 1) {
    const asteroid = asteroids[i];

    const dxShip = asteroid.x - ship.x;
    const dyShip = asteroid.y - ship.y;

    if (Math.hypot(dxShip, dyShip) < asteroid.radius + ship.radius - 2) {
      gameOver = true;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("arcade-asteroids-highscore", String(highScore));
      }
      return;
    }

    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      const bullet = bullets[j];
      const dx = asteroid.x - bullet.x;
      const dy = asteroid.y - bullet.y;

      if (Math.hypot(dx, dy) < asteroid.radius + bullet.radius) {
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.fillStyle = "#040411";
  ctx.fillRect(0, 0, world.width, world.height);

  for (let i = 0; i < 120; i += 1) {
    const x = (i * 137) % world.width;
    const y = (i * 97) % world.height;
    const twinkle = 0.5 + 0.5 * Math.sin((performance.now() / 500) + i);
    ctx.fillStyle = `rgba(200, 220, 255, ${twinkle * 0.8})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);

  ctx.fillStyle = "#5fd2ff";
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(14, 14);
  ctx.lineTo(0, 8);
  ctx.lineTo(-14, 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd36e";
  ctx.fillRect(-3, 7, 6, 9);

  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = "#fffa8d";
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAsteroids() {
  for (const asteroid of asteroids) {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    ctx.fillStyle = "#8b93a8";
    ctx.beginPath();
    for (let p = 0; p < 8; p += 1) {
      const angle = (p / 8) * Math.PI * 2;
      const r = asteroid.radius * (0.76 + ((p % 2) * 0.24));
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (p === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

function drawHud() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Trebuchet MS";
  ctx.fillText(`Score: ${score}`, 18, 34);
  ctx.fillText(`Highscore: ${highScore}`, 18, 64);
}

function drawGameOver() {
  if (!gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(4, 4, 18, 0.78)";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "#ff7070";
  ctx.font = "bold 54px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", world.width / 2, world.height / 2 - 18);

  ctx.fillStyle = "#f5f6ff";
  ctx.font = "24px Trebuchet MS";
  ctx.fillText("Drücke R für Neustart", world.width / 2, world.height / 2 + 30);

  ctx.textAlign = "left";
}

function tick(now) {
  const dt = Math.min((now - prevTime) / 1000, 0.032);
  prevTime = now;

  if (!gameOver) {
    updateShip(dt);

    if (keys.has(" ")) {
      fireBullet(now);
    }

    if (now - lastSpawn > settings.asteroidSpawnMs) {
      lastSpawn = now;
      spawnAsteroid();
    }

    updateBullets(dt);
    updateAsteroids(dt);
    checkCollisions();
  }

  drawBackground();
  drawBullets();
  drawAsteroids();
  drawShip();
  drawHud();
  drawGameOver();

  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "r", "R"].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === "r" || event.key === "R") {
    resetGame();
  }

  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

requestAnimationFrame(tick);
