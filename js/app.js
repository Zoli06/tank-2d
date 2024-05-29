const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Player {
  positionX = 100;
  positionY = 100;
  width = 100;
  height = 100;
  rotation = 0;

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
    ctx.translate(this.positionY, this.positionY);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.translate(-this.middleX, -this.middleY);
    ctx.drawImage(this.#image, this.positionX, this.positionY);
    ctx.restore();
  }
}

class GameMap {
  #wallWidth = 10;
  #blockSize = 50;
  #wallColor = '#ff0000';
  #tunnelColor = '#00ff00';
  #map;

  constructor(map) {
    this.#map = map
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
        const blockEndX = blockStartX + this.#blockSize;
        const blockEndY = blockStartY + this.#blockSize;
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
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
    [[0, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0]],
  ]);
  await player.initialize('img/tank_1.png');

  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameMap.render();
    player.render();

    // if d is pressed, rotate right
    if (pressedKeys['D'.charCodeAt(0)])
    {
      player.rotation += 2;
    }
    // if a is pressed, rotate left
    if (pressedKeys['A'.charCodeAt(0)])
    {
      player.rotation -= 2;
    }

    // not working
    // // if w is pressed, move forward
    // if (pressedKeys['W'.charCodeAt(0)])
    // {
    //   // limit to 360 degrees
    //   player.rotation = player.rotation % 360;
      

    //   radians = player.rotation * Math.PI / 180;
    //   player.positionX += Math.cos(radians);
    //   player.positionY += Math.sin(radians);
    // }

    await sleep(50);
  }
}


start();
