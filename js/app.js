const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Player {
  positionX = 100;
  positionY = 100;
  width = 100;
  height = 100;
  rotation = 45;

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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function start() {
  const player = new Player();
  await player.initialize('img/tank_1.png');

  while (true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.render();
    player.rotation++;
    await sleep(50);
  }
}

start();
