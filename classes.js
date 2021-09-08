///////////////////////////////
//классовая структура проекта//
///////////////////////////////
class Game {
  constructor(state) {
    this.turn = 1;
    this.state = [];
    this.isAI = state["isAI"];
    this.xCellSize = state["cellsInRow"];
    this.yCellSize = state["cellsInColumn"];
    for (let i = 0; i < this.xCellSize; i++) {
      this.state[i] = [];
      for (let j = 0; j < this.yCellSize; j++) {
        this.state[i][j] = false;
      }
    }
    this.currentTurn = Math.round(Math.random());
    this.area = this.xCellSize * this.yCellSize;
    this.isFinished = false;
  }

  nextTurn() {
    this.currentTurn = (this.currentTurn + 1) % 2;
    this.turn++;
  }

  initCanvas() {
    const windowInnerWidth = window.innerWidth;
    canvas.width = this.xCellSize * can.cellSize;
    const aspectRatioY = canvas.width / windowInnerWidth;
    canvas.style.display = "inherit";
    canvas.height =
      can.headerHeight + this.yCellSize * can.cellSize + can.footerHeight;
    document.body.style.maxWidth = canvas.width + "px";
    //чтобы на мобилках игровое поле не превышало ширину экрана
    if (aspectRatioY > 1) {
      canvas.style.width = windowInnerWidth + "px";
      canvas.style.height = canvas.height / aspectRatioY + "px";
    } else {
      canvas.style.width = canvas.width + "px";
      canvas.style.height = canvas.height + "px";
    }
    render.clear();
    render.grid(this.xCellSize, this.yCellSize);
  }

  draw() {
    return this.area < this.turn;
  }
}

class Player {
  constructor(name, state, callbackAnimation) {
    this.callbackAnimation = callbackAnimation;
    this.name = name;
    this.state = [];
    this.xCellSize = state["cellsInRow"];
    this.yCellSize = state["cellsInColumn"];
    for (let i = 0; i < +this.xCellSize; i++) {
      this.state[i] = [];
      for (let j = 0; j < +this.yCellSize; j++) {
        this.state[i][j] = false;
      }
    }
  }

  checkWinner() {
    let condition;
    for (let i = 0; i < this.xCellSize - 2; i++) {
      for (let j = 0; j < this.yCellSize - 2; j++) {
        condition =
          (this.state[i][j] && this.state[i + 1][j] && this.state[i + 2][j]) ||
          (this.state[i][j + 1] &&
            this.state[i + 1][j + 1] &&
            this.state[i + 2][j + 1]) ||
          (this.state[i][j + 2] &&
            this.state[i + 1][j + 2] &&
            this.state[i + 2][j + 2]) ||
          (this.state[i][j] && this.state[i][j + 1] && this.state[i][j + 2]) ||
          (this.state[i + 1][j] &&
            this.state[i + 1][j + 1] &&
            this.state[i + 1][j + 2]) ||
          (this.state[i + 2][j] &&
            this.state[i + 2][j + 1] &&
            this.state[i + 2][j + 2]) ||
          (this.state[i][j] &&
            this.state[i + 1][j + 1] &&
            this.state[i + 2][j + 2]) ||
          (this.state[i][j + 2] &&
            this.state[i + 1][j + 1] &&
            this.state[i + 2][j]);
        if (condition) {
          return true;
        }
      }
    }
    return false;
  }

  congratulation() {
    render.clearHeader();
    render.textHeader(this.name + " выиграл!!!");
  }

  check(x, y, progress) {
    this.callbackAnimation(x, y, progress);
  }
}

class AI extends Player {
  constructor(name, state, callbackAnimation) {
    super(name, state, callbackAnimation);
  }

  randomTurn(game) {
    const turnsLeft = game.area - game.turn;
    const randomTurn = Math.round(turnsLeft * Math.random());
    const arr = [];
    for (let i = 0; i < game.xCellSize; i++) {
      for (let j = 0; j < game.yCellSize; j++) {
        if (!game.state[i][j]) {
          arr.push([i, j]);
        }
      }
    }
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
