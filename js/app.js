let score1 = 0;
let score2 = 0;

async function play() {
  class Player {
    positionX;
    positionY;
    width = 50;
    height = 50;
    rotation = 0;
    forwardspeed = 5;
    backwardsSpeed = 3;
    rotateSpeed = 5;
    fireCooldown = 1000;
    #lastFireTime = 0;

    #image = new Image();
    #bulletImage = new Image();

    #controls = {};

    // TODO: adjust middle point
    get middleX() {
      return this.positionX + this.width / 2;
    }

    get middleY() {
      return this.positionY + this.height / 2;
    }

    constructor(
      positionX,
      positionY,
      forwardKey,
      leftKey,
      backwardKey,
      rightKey,
      fireKey,
      image,
      bulletImage
    ) {
      this.positionX = positionX;
      this.positionY = positionY;
      this.#controls['forward'] = forwardKey;
      this.#controls['left'] = leftKey;
      this.#controls['backward'] = backwardKey;
      this.#controls['right'] = rightKey;
      this.#controls['fire'] = fireKey;
      this.#image = image;
      this.#bulletImage = bulletImage;
    }

    isCircleInPlayer(x, y, radius) {
      // get all points in circle
      const coordinates = [];
      for (let i = x - radius; i < x + radius; i++) {
        for (let j = y - radius; j < y + radius; j++) {
          if (Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) <= radius) {
            coordinates.push([i, j]);
          }
        }
      }

      // check if point is inside player
      for (let i = 0; i < coordinates.length; i++) {
        if (
          coordinates[i][0] >= this.positionX &&
          coordinates[i][0] <= this.positionX + this.width &&
          coordinates[i][1] >= this.positionY &&
          coordinates[i][1] <= this.positionY + this.height
        ) {
          return [coordinates[i][0], coordinates[i][1]];
        }
      }

      return false;
    }

    async update(gameMap) {
      if (pressedKeys[this.#controls['right']]) {
        const newRotation = this.rotation + this.rotateSpeed;

        if (
          !gameMap.isRectangleInWall(
            this.positionX,
            this.positionY,
            this.width,
            this.height,
            (newRotation * Math.PI) / 180
          )
        ) {
          this.rotation = newRotation;
        }
      }
      if (pressedKeys[this.#controls['left']]) {
        const newRotation = this.rotation - this.rotateSpeed;

        if (
          !gameMap.isRectangleInWall(
            this.positionX,
            this.positionY,
            this.width,
            this.height,
            (newRotation * Math.PI) / 180
          )
        ) {
          this.rotation = newRotation;
        }
      }
      if (pressedKeys[this.#controls['forward']]) {
        console.log('W pressed');
        const r = 90 - this.rotation;

        const newX =
          this.positionX + Math.cos((r * Math.PI) / 180) * this.forwardspeed;
        const newY =
          this.positionY - Math.sin((r * Math.PI) / 180) * this.forwardspeed;

        if (
          !gameMap.isRectangleInWall(
            newX,
            newY,
            this.width,
            this.height,
            (this.rotation * Math.PI) / 180
          )
        ) {
          this.positionX = newX;
          this.positionY = newY;
        }
      }
      if (pressedKeys[this.#controls['backward']]) {
        const r = 90 - this.rotation;

        const newX =
          this.positionX - Math.cos((r * Math.PI) / 180) * this.backwardsSpeed;
        const newY =
          this.positionY + Math.sin((r * Math.PI) / 180) * this.backwardsSpeed;

        if (
          !gameMap.isRectangleInWall(
            newX,
            newY,
            this.width,
            this.height,
            (this.rotation * Math.PI) / 180
          )
        ) {
          this.positionX = newX;
          this.positionY = newY;
        }
      }
      if (
        pressedKeys[this.#controls['fire']] &&
        new Date().getTime() - this.#lastFireTime > this.fireCooldown
      ) {
        const radius = 5;

        // bullet and tank middle distance
        const distance = this.height / 2 + radius / 2;
        const radians = (this.rotation * Math.PI) / 180;
      
        const bulletMiddlePositionX = Math.sin(radians) * distance + this.middleX;
        const bulletMiddlePositionY = -Math.cos(radians) * distance + this.middleY;
      
        const bullet = new Bullet(
          bulletMiddlePositionX,
          bulletMiddlePositionY,
          radius,
          this.rotation,
          this.#bulletImage
        );
        bullets.push(bullet);
        this.#lastFireTime = new Date().getTime();
      }
    }

    render() {
      ctx.save();
      ctx.translate(
        this.positionX + this.width / 2,
        this.positionY + this.height / 2
      );
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.translate(
        -this.positionX - this.width / 2,
        -this.positionY - this.height / 2
      );
      ctx.drawImage(
        this.#image,
        this.positionX,
        this.positionY,
        this.width,
        this.height
      );

      // draw 2px rectangle around player for debugging
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(this.positionX, this.positionY, this.width, this.height);

      ctx.restore();
    }
  }

  class GameMap {
    #wallWidthPercentage = 0.1;
    #blockSize = 100;
    #wallColor = '#ff0000';
    #tunnelColor = '#00ff00';
    #map;

    get wallWidth() {
      return this.#blockSize * this.#wallWidthPercentage;
    }

    constructor(blocksize, map) {
      this.#blockSize = blocksize;
      this.#map = map;
    }

    isCoordinateInWall(x, y) {
      // input coordinates are in pixels

      // get block coordinates
      const blockX = Math.floor(x / this.#blockSize);
      const blockY = Math.floor(y / this.#blockSize);

      const blockStartX = blockX * this.#blockSize;
      const blockStartY = blockY * this.#blockSize;
      const blockEndX = blockStartX + this.#blockSize;
      const blockEndY = blockStartY + this.#blockSize;
      if (this.#map[blockY][blockX][0]) {
        if (
          x >= blockStartX &&
          x <= blockStartX + this.#blockSize / 2 + this.wallWidth / 2 &&
          y >= blockStartY + this.#blockSize / 2 - this.wallWidth / 2 &&
          y <= blockStartY + this.#blockSize / 2 + this.wallWidth / 2
        ) {
          return true;
        }
      }
      if (this.#map[blockY][blockX][1]) {
        if (
          x >= blockStartX + this.#blockSize / 2 - this.wallWidth / 2 &&
          x <= blockEndX &&
          y >= blockStartY + this.#blockSize / 2 - this.wallWidth / 2 &&
          y <= blockStartY + this.#blockSize / 2 + this.wallWidth / 2
        ) {
          return true;
        }
      }
      if (this.#map[blockY][blockX][2]) {
        if (
          x >= blockStartX + this.#blockSize / 2 - this.wallWidth / 2 &&
          x <= blockStartX + this.#blockSize / 2 + this.wallWidth / 2 &&
          y >= blockStartY &&
          y <= blockStartY + this.#blockSize / 2 + this.wallWidth / 2
        ) {
          return true;
        }
      }
      if (this.#map[blockY][blockX][3]) {
        if (
          x >= blockStartX + this.#blockSize / 2 - this.wallWidth / 2 &&
          x <= blockStartX + this.#blockSize / 2 + this.wallWidth / 2 &&
          y >= blockStartY + this.#blockSize / 2 - this.wallWidth / 2 &&
          y <= blockEndY
        ) {
          return true;
        }
      }

      return false;
    }

    isRectangleInWall(x, y, width, height, rotation) {
      const coordinates = [];
      for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
          coordinates.push([i, j]);
        }
      }

      // get middle point
      const middleX = x + width / 2;
      const middleY = y + height / 2;

      // rotate each point around middle point
      const rotatedCoordinates = [];
      for (let i = 0; i < coordinates.length; i++) {
        const x = coordinates[i][0];
        const y = coordinates[i][1];
        const newX =
          Math.cos(rotation) * (x - middleX) -
          Math.sin(rotation) * (y - middleY) +
          middleX;
        const newY =
          Math.sin(rotation) * (x - middleX) +
          Math.cos(rotation) * (y - middleY) +
          middleY;
        rotatedCoordinates.push([newX, newY]);
      }

      // check if rotated point is inside wall
      for (let i = 0; i < rotatedCoordinates.length; i++) {
        if (
          this.isCoordinateInWall(
            rotatedCoordinates[i][0],
            rotatedCoordinates[i][1]
          )
        ) {
          return [rotatedCoordinates[i][0], rotatedCoordinates[i][1]];
        }
      }

      return false;
    }

    isCircleInWall(x, y, radius) {
      // get all points in circle
      const coordinates = [];
      for (let i = x - radius; i < x + radius; i++) {
        for (let j = y - radius; j < y + radius; j++) {
          if (Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) <= radius) {
            coordinates.push([i, j]);
          }
        }
      }

      // check if point is inside wall
      for (let i = 0; i < coordinates.length; i++) {
        if (this.isCoordinateInWall(coordinates[i][0], coordinates[i][1])) {
          return [coordinates[i][0], coordinates[i][1]];
        }
      }

      return false;
    }

    render() {
      // 3d matrix
      // first value is horizontal on left
      // second value is horizontal on right
      // third value is vertical on top
      // fourth value is vertical on bottom

      // set canvas size
      canvas.width = this.#map[0].length * this.#blockSize;
      canvas.height = this.#map.length * this.#blockSize;

      // draw walls
      for (let y = 0; y < this.#map.length; y++) {
        for (let x = 0; x < this.#map[y].length; x++) {
          const blockStartX = x * this.#blockSize;
          const blockStartY = y * this.#blockSize;
          ctx.fillStyle = this.#tunnelColor;
          ctx.fillRect(
            blockStartX,
            blockStartY,
            this.#blockSize,
            this.#blockSize
          );
          if (this.#map[y][x][0]) {
            // line from left middle to middle
            ctx.fillStyle = this.#wallColor;
            ctx.fillRect(
              blockStartX,
              blockStartY + this.#blockSize / 2 - this.wallWidth / 2,
              this.#blockSize / 2 + this.wallWidth / 2,
              this.wallWidth
            );
          }
          if (this.#map[y][x][1]) {
            // line from right middle to middle
            ctx.fillStyle = this.#wallColor;
            ctx.fillRect(
              blockStartX + this.#blockSize / 2 - this.wallWidth / 2,
              blockStartY + this.#blockSize / 2 - this.wallWidth / 2,
              this.#blockSize / 2 + this.wallWidth / 2,
              this.wallWidth
            );
          }
          if (this.#map[y][x][2]) {
            // line from top middle to middle
            ctx.fillStyle = this.#wallColor;
            ctx.fillRect(
              blockStartX + this.#blockSize / 2 - this.wallWidth / 2,
              blockStartY,
              this.wallWidth,
              this.#blockSize / 2 + this.wallWidth / 2
            );
          }
          if (this.#map[y][x][3]) {
            // line from bottom middle to middle
            ctx.fillStyle = this.#wallColor;
            ctx.fillRect(
              blockStartX + this.#blockSize / 2 - this.wallWidth / 2,
              blockStartY + this.#blockSize / 2 - this.wallWidth / 2,
              this.wallWidth,
              this.#blockSize / 2 + this.wallWidth / 2
            );
          }
        }
      }
    }
  }

  class Bullet {
    middleX;
    middleY;
    radius;
    rotation;
    speed = 7;
    timeToLive = 5000;
    createdTime;

    #image = new Image();

    get positionX() {
      return this.middleX - this.radius;
    }

    get positionY() {
      return this.middleY - this.radius;
    }

    constructor(middlePositionX, middlePositionY, radius, rotation, image) {
      this.middleX = middlePositionX;
      this.middleY = middlePositionY;
      this.radius = radius;
      this.rotation = rotation;
      this.createdTime = new Date().getTime();
      this.#image = image;
    }

    async update(gameMap) {
      // const collidingPoint = gameMap.isCircleInWall(newMiddleX, newMiddleY, this.width / 2);
      // if (collidingPoint) {
      //   // get angle between bullet and wall then reflect
      //   // rotation is in degrees
      //   const wallX = collidingPoint[0];
      //   const wallY = collidingPoint[1];
      //   const angle = Math.atan2(wallY - this.middleY, wallX - this.middleX);

      //   const newAngle = 2 * angle - this.rotation * Math.PI / 180;
      //   this.rotation = newAngle * 180 / Math.PI;
      // }

      if (gameMap.isCircleInWall(this.middleX, this.middleY, this.radius)) {
        bullets.splice(bullets.indexOf(this), 1);
      }

      const r = 90 - this.rotation;

      this.middleX += Math.cos((r * Math.PI) / 180) * this.speed;
      this.middleY -= Math.sin((r * Math.PI) / 180) * this.speed;

      if (new Date().getTime() - this.createdTime > this.timeToLive) {
        bullets.splice(bullets.indexOf(this), 1);
      }
    }

    render() {
      ctx.save();
      ctx.translate(this.positionX + this.radius, this.positionY + this.radius);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.translate(-this.positionX - this.radius, -this.positionY - this.radius);
      ctx.drawImage(
        this.#image,
        this.positionX,
        this.positionY,
        this.radius * 2,
        this.radius * 2
      );

      // // draw 2px rectangle around for debugging
      // ctx.strokeStyle = '#000000';
      // ctx.strokeRect(
      //   this.positionX,
      //   this.positionY,
      //   this.radius * 2,
      //   this.radius * 2
      // );

      ctx.restore();
    }
  }

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const pressedKeys = {};
  const bullets = [];

  const initializeImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  
  // Test for player
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  window.onkeyup = function (e) {
    pressedKeys[e.keyCode] = false;
  };
  window.onkeydown = function (e) {
    pressedKeys[e.keyCode] = true;
  };

  const score1Text = document.getElementById('score1');
  const score2Text = document.getElementById('score2');

  const tankImage1 = await initializeImage('img/tank_1.png');
  const tankImage2 = await initializeImage('img/tank_2.png');
  const bulletImage = await initializeImage('img/bullet.png');

  const player1 = new Player(
    70,
    70,
    'W'.charCodeAt(0),
    'A'.charCodeAt(0),
    'S'.charCodeAt(0),
    'D'.charCodeAt(0),
    'F'.charCodeAt(0),
    tankImage1,
    bulletImage
  );
  const player2 = new Player(
    500,
    510,
    'I'.charCodeAt(0),
    'J'.charCodeAt(0),
    'K'.charCodeAt(0),
    'L'.charCodeAt(0),
    'H'.charCodeAt(0),
    tankImage2,
    bulletImage
  );

  const map = [
    [
      [0, 1, 0, 1],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 1],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
    ],
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 1, 0],
    ],
  ];

  const gameMap = new GameMap(document.defaultView?.innerHeight / map[0].length * .95, map);

  let isEnded = false;
  while (!isEnded) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await player1.update(gameMap);
    await player2.update(gameMap);

    for (let i = 0; i < bullets.length; i++) {
      await bullets[i].update(gameMap, [player1, player2]);

      if (!bullets[i]) {
        continue;
      }

      // check if bullet is colliding with player
      if (
        player1.isCircleInPlayer(
          bullets[i].middleX,
          bullets[i].middleY,
          bullets[i].radius
        )
      ) {
        score1++;
        score1Text.innerText = score1;
        bullets.splice(bullets.indexOf(this), 1);
        alert('Player 1 wins');
        isEnded = true;
        break;
      }

      if (
        player2.isCircleInPlayer(
          bullets[i].middleX,
          bullets[i].middleY,
          bullets[i].radius
        )
      ) {
        score2++;
        score2Text.innerText = score2;
        bullets.splice(bullets.indexOf(this), 1);
        alert('Player 2 wins');
        isEnded = true;
        break;
      }
    }

    gameMap.render();
    player1.render();
    player2.render();

    for (let i = 0; i < bullets.length; i++) {
      bullets[i].render();
    }

    await sleep(50);
  }
}

(async() => {
  while (true) {
    await play();
  }
})()