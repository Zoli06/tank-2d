const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Player {
  positionX = 70;
  positionY = 70;
  width = 50;
  height = 50;
  rotation = 0;
  forwardspeed = 5;
  backwardsSpeed= 3;
  rotateSpeed = 5;

  #image = new Image();

  // TODO: adjust middle point
  get middleX() {
    return this.positionX + (this.width / 2);
  }

  get middleY() {
    return this.positionY + (this.height / 2);
  }


  async initialize(src) {
    return new Promise((resolve, reject) => {
      this.#image = new Image();
      this.#image.onload = resolve;
      this.#image.onerror = reject;
      this.#image.src = src;
    });
  }

  render() {
    console.log('Player render');

    ctx.save();
    ctx.translate(this.positionX + this.width / 2, this.positionY + this.height / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.translate(-this.positionX - this.width / 2, -this.positionY - this.height / 2);
    ctx.drawImage(this.#image, this.positionX, this.positionY, this.width, this.height);

    // draw 2px rectangle around player for debugging
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(this.positionX, this.positionY, this.width, this.height);

    ctx.restore();
  }
}

class GameMap {
  #wallWidth = 20;
  #blockSize = 100;
  #wallColor = '#ff0000';
  #tunnelColor = '#00ff00';
  #map;

  constructor(map) {
    this.#map = map
  }

  isCoordinateWall(x, y) {
    // input coordinates are in pixels

    // get block coordinates
    const blockX = Math.floor(x / this.#blockSize);
    const blockY = Math.floor(y / this.#blockSize);

    const blockStartX = blockX * this.#blockSize;
    const blockStartY = blockY * this.#blockSize;
    const blockEndX = blockStartX + this.#blockSize;
    const blockEndY = blockStartY + this.#blockSize;
    if (this.#map[blockY][blockX][0]) {
      if (x >= blockStartX && x <= blockStartX + this.#blockSize / 2 + this.#wallWidth / 2 && y >= blockStartY + this.#blockSize / 2 - this.#wallWidth / 2 && y <= blockStartY + this.#blockSize / 2 + this.#wallWidth / 2) {
        return true;
      }
    }
    if (this.#map[blockY][blockX][1]) {
      if (x >= blockStartX + this.#blockSize / 2 - this.#wallWidth / 2 && x <= blockEndX && y >= blockStartY + this.#blockSize / 2 - this.#wallWidth / 2 && y <= blockStartY + this.#blockSize / 2 + this.#wallWidth / 2) {
        return true;
      }
    }
    if (this.#map[blockY][blockX][2]) {
      if (x >= blockStartX + this.#blockSize / 2 - this.#wallWidth / 2 && x <= blockStartX + this.#blockSize / 2 + this.#wallWidth / 2 && y >= blockStartY && y <= blockStartY + this.#blockSize / 2 + this.#wallWidth / 2) {
        return true;
      }
    }
    if (this.#map[blockY][blockX][3]) {
      if (x >= blockStartX + this.#blockSize / 2 - this.#wallWidth / 2 && x <= blockStartX + this.#blockSize / 2 + this.#wallWidth / 2 && y >= blockStartY + this.#blockSize / 2 - this.#wallWidth / 2 && y <= blockEndY) {
        return true;
      }
    }

    return false;
  }

  isRectangleWall(x, y, width, height, rotation) {
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
      const newX = Math.cos(rotation) * (x - middleX) - Math.sin(rotation) * (y - middleY) + middleX;
      const newY = Math.sin(rotation) * (x - middleX) + Math.cos(rotation) * (y - middleY) + middleY;
      rotatedCoordinates.push([newX, newY]);
    }

    // check if rotated point is inside wall
    for (let i = 0; i < rotatedCoordinates.length; i++) {
      if (this.isCoordinateWall(rotatedCoordinates[i][0], rotatedCoordinates[i][1])) {
        return true;
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
        ctx.fillRect(blockStartX, blockStartY, this.#blockSize, this.#blockSize);
        if (this.#map[y][x][0]) {
          // line from left middle to middle
          ctx.fillStyle = this.#wallColor;
          ctx.fillRect(blockStartX, blockStartY + this.#blockSize / 2 - this.#wallWidth / 2, this.#blockSize / 2 + this.#wallWidth / 2, this.#wallWidth);
        }
        if (this.#map[y][x][1]) {
          // line from right middle to middle
          ctx.fillStyle = this.#wallColor;
          ctx.fillRect(blockStartX + this.#blockSize / 2 - this.#wallWidth / 2, blockStartY + this.#blockSize / 2 - this.#wallWidth / 2, this.#blockSize / 2 + this.#wallWidth / 2, this.#wallWidth);
        }
        if (this.#map[y][x][2]) {
          // line from top middle to middle
          ctx.fillStyle = this.#wallColor;
          ctx.fillRect(blockStartX + this.#blockSize / 2 - this.#wallWidth / 2, blockStartY, this.#wallWidth, this.#blockSize / 2 + this.#wallWidth / 2);
        }
        if (this.#map[y][x][3]) {
          // line from bottom middle to middle
          ctx.fillStyle = this.#wallColor;
          ctx.fillRect(blockStartX + this.#blockSize / 2 - this.#wallWidth / 2, blockStartY + this.#blockSize / 2 - this.#wallWidth / 2, this.#wallWidth, this.#blockSize / 2 + this.#wallWidth / 2);
        }
      }
    }
  }
}


// Test for player
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function start() {
  var pressedKeys = {};
  window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
  window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

  const player = new Player();
  const gameMap = new GameMap([
    [[0, 1, 0, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [0, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 1]],
    [[0, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0]],
  ]);
  await player.initialize('img/tank_1.png');

  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameMap.render();
    player.render();

    if (pressedKeys['D'.charCodeAt(0)])
    {
      const newRotation = player.rotation + player.rotateSpeed;

      if (!gameMap.isRectangleWall(player.positionX, player.positionY, player.width, player.height, newRotation * Math.PI / 180)) {
        player.rotation = newRotation;
      }
    }
    if (pressedKeys['A'.charCodeAt(0)])
    {
      const newRotation = player.rotation - player.rotateSpeed;

      if (!gameMap.isRectangleWall(player.positionX, player.positionY, player.width, player.height, newRotation * Math.PI / 180)) {
        player.rotation = newRotation;
      }
    }
    if (pressedKeys['W'.charCodeAt(0)])
    {
      console.log('W pressed');
      const r = 90 - player.rotation;
      
      const newX = player.positionX + Math.cos(r * Math.PI / 180) * player.forwardspeed;
      const newY = player.positionY - Math.sin(r * Math.PI / 180) * player.forwardspeed;

      if (!gameMap.isRectangleWall(newX, newY, player.width, player.height, player.rotation * Math.PI / 180)) {
        player.positionX = newX;
        player.positionY = newY;
      }
    }
    if (pressedKeys['S'.charCodeAt(0)])
    {
      const r = 90-player.rotation;

      const newX = player.positionX - Math.cos(r * Math.PI / 180) * player.backwardsSpeed;
      const newY = player.positionY + Math.sin(r * Math.PI / 180) * player.backwardsSpeed;

      if (!gameMap.isRectangleWall(newX, newY, player.width, player.height, player.rotation * Math.PI / 180)) {
        player.positionX = newX;
        player.positionY = newY;
      }
    }

    await sleep(50);
  }
}


start();
