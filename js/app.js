const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class GameMap {
  wallWidth = 10;
  blockSize = 50;
  wallColor = '#ff0000';
  tunnelColor = '#00ff00';

  render(map) {
    // 3d matrix
    // first value is horizontal on left
    // second value is horizontal on right
    // third value is vertical on top
    // fourth value is vertical on bottom

    // set canvas size
    canvas.width = map[0].length * this.blockSize;
    canvas.height = map.length * this.blockSize;
    
    // draw walls
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const blockStartX = x * this.blockSize;
        const blockStartY = y * this.blockSize;
        const blockEndX = blockStartX + this.blockSize;
        const blockEndY = blockStartY + this.blockSize;
        ctx.fillStyle = this.tunnelColor;
        ctx.fillRect(blockStartX, blockStartY, this.blockSize, this.blockSize);
        if (map[y][x][0]) {
          console.log('left');
          // line from left middle to middle
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(blockStartX, blockStartY + this.blockSize / 2 - this.wallWidth / 2, this.blockSize / 2 + this.wallWidth / 2, this.wallWidth);
        }
        if (map[y][x][1]) {
          console.log('right');
          // line from right middle to middle
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(blockStartX + this.blockSize / 2 - this.wallWidth / 2, blockStartY + this.blockSize / 2 - this.wallWidth / 2, this.blockSize / 2 + this.wallWidth / 2, this.wallWidth);
        }
        if (map[y][x][2]) {
          console.log('top');
          // line from top middle to middle
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(blockStartX + this.blockSize / 2 - this.wallWidth / 2, blockStartY, this.wallWidth, this.blockSize / 2 + this.wallWidth / 2);
        }
        if (map[y][x][3]) {
          console.log('bottom');
          // line from bottom middle to middle
          ctx.fillStyle = this.wallColor;
          ctx.fillRect(blockStartX + this.blockSize / 2 - this.wallWidth / 2, blockStartY + this.blockSize / 2 - this.wallWidth / 2, this.wallWidth, this.blockSize / 2 + this.wallWidth / 2);
        }
      }
    }
  }
}

// const gameMap = new GameMap();
// // 10x10
// gameMap.render([
//   [[0, 1, 0, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
//   [[0, 1, 1, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0]],
// ]);
