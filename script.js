//переменные
const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const gameSize = document.querySelector(".game-size");
const other = document.getElementById("other");
const otherSize = document.querySelector(".other-size");
const buttonSubmit = document.querySelector(".submit");
let game, p1, p2, players;

//открываем или закрываем доступ к кастомным размерам поля
gameSize.addEventListener("click", () => {
  if (other.checked) {
    otherSize.style.display = "block";
  } else {
    otherSize.style.display = "none";
  }
});

//начинаем игру путем нажатия на кнопку
buttonSubmit.addEventListener("click", startGame);
//сам коллбэк
function startGame() {
  const state = readForm();
  renameButton();
  [game, p1, p2, players] = initObjects(state);
  console.log(game);
  gameIsOn(game, players);
}
//читаем данные из формы
function readForm() {
  //PVP or PVE
  let state = [];
  const isAI = document.getElementsByName("is_AI");
  state["isAI"] = isAI[0].checked ? false : true;
  //Players names
  state["p1Name"] =
    document.getElementsByName("player_1")[0].value || "Игрок 1";
  state["p2Name"] =
    document.getElementsByName("player_2")[0].value || "Игрок 2";
  //Field size
  const size = document.getElementsByName("size");
  if (size[3].checked) {
    state["cellsInRow"] = document.getElementById("x-size").value || 3;
    state["cellsInColumn"] = document.getElementById("y-size").value || 3;
  } else {
    for (let i = 0; i < 3; i++) {
      if (size[i].checked) {
        state["cellsInRow"] = state["cellsInColumn"] =
          document.getElementsByName("size")[i].value;
      }
    }
  }
  return state;
}
//переименовываем кнопку начала игры
function renameButton() {
  buttonSubmit.innerHTML = "<h4>Рестарт</h4>";
}
//инициализируем объекты
function initObjects(state) {
  game = new Game(state);
  p1 = new Player(state["p1Name"], state, render.cross);
  p2 = game.isAI
    ? new AI(state["p2Name"], state, render.circle)
    : new Player(state["p2Name"], state, render.circle);
  const players = [p1, p2];
  game.initCanvas();
  return [game, p1, p2, players];
}
//Основа геймплея здесь
async function gameIsOn(game, players) {
  render.currentState(game, players);
  let xCell, yCell, currentPlayer;
  //если с ботом и у него первый ход
  if (players[game.currentTurn].constructor.name == "AI" && game.turn == 1) {
    currentPlayer = players[game.currentTurn];
    [xCell, yCell] = [
      Math.round((game.xCellSize - 1) * Math.random()),
      Math.round((game.yCellSize - 1) * Math.random()),
    ];
    game.state[xCell][yCell] = true;
    currentPlayer.state[xCell][yCell] = true;
    currentPlayer.check(xCell, yCell, 1);
    game.nextTurn();
    render.currentState(game, players);
  }
  //чтение нажатия на canvas
  canvas.addEventListener("mousedown", (event) => {
    let [x, y] = getCoordinates(canvas, event);
    console.log([x, y]);
    let cell = getCellCoordinates([x, y]);
    [xCell, yCell] = cell;
    //если клик обоснован (игра идет, поле не закрашено)
    if (
      !(yCell === undefined) &&
      !game.state[xCell][yCell] &&
      !game.isFinished &&
      players[game.currentTurn].constructor.name == "Player"
    ) {
      game.state[xCell][yCell] = true;
      currentPlayer = players[game.currentTurn];
      render.currentState(game, players);
      currentPlayer.state[xCell][yCell] = true;
      //здесь могла быть анимация
      currentPlayer.check(xCell, yCell, 0.8);
      //render.currentState(game, players);
      //здесь могла быть анимация
      if (currentPlayer.checkWinner()) {
        currentPlayer.congratulation();
        game.isFinished = true;
        return;
      }
      game.nextTurn();
      render.currentState(game, players);
    }
    //если с ботом, то он продолжает ход
    if (players[game.currentTurn].constructor.name == "AI") {
      currentPlayer = players[game.currentTurn];
      console.log(currentPlayer.randomTurn(game));
      [xCell, yCell] = currentPlayer.randomTurn(game);

      game.state[xCell][yCell] = true;
      render.currentState(game, players);
      currentPlayer.state[xCell][yCell] = true;
      //здесь могла быть анимация
      currentPlayer.check(xCell, yCell, 1);
      render.currentState(game, players);
      //здесь могла быть анимация
      if (currentPlayer.checkWinner()) {
        currentPlayer.congratulation();
        game.isFinished = true;
        return;
      }
      game.nextTurn();
      render.currentState(game, players);
    }
    //ничья, если кончились ходы
    if (game.draw()) {
      render.clear();
      render.textHeader("Ничья!");
      game.isFinished = true;
      return;
    }
  });
}

//свойства постороения (размеры блоков на canvas). В целом, этот объект может определяться
//из свойств экрана при нажатии на кнопку старта
const can = {
  headerHeight: 100,
  footerHeight: 50,
  cellSize: 100,
  lineWidth: 5,
  gap: 10,
};
//отдельная библиотека с методами прорисовки на canvas
const render = {
  styleHeader: () => {
    ctx.lineWidth = can.lineWidth;
    ctx.lineCap = "round";
    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  },
  styleFooter: () => {
    ctx.lineWidth = can.lineWidth;
    ctx.lineCap = "round";
    ctx.fillStyle = "white";
    ctx.font = can.footerHeight - 2 * can.gap + "px serif";
    ctx.textAlign = "end";
    ctx.textBaseline = "middle";
  },
  currentState: (game, players) => {
    render.clear();
    render.grid(game.xCellSize, game.yCellSize);
    render.textHeader(`Ходит ${players[game.currentTurn].name}`);
    render.textFooter(`Ход ${game.turn}/${game.area}`);
    for (let i = 0; i < game.xCellSize; i++) {
      for (let j = 0; j < game.yCellSize; j++) {
        for (let k = 0; k < players.length; k++) {
          if (players[k].state[i][j]) {
            players[k].check(i, j, 1);
          }
        }
      }
    }
  },
  clear: () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },
  grid: (xCellSize, yCellSize) => {
    ctx.lineWidth = can.lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    for (var i = 1; i < xCellSize; i++) {
      ctx.beginPath();
      ctx.moveTo(can.cellSize * i, can.headerHeight + can.gap);
      ctx.lineTo(can.cellSize * i, canvas.height - can.footerHeight - can.gap);
      ctx.stroke();
    }

    for (var i = 1; i < yCellSize; i++) {
      ctx.beginPath();
      ctx.moveTo(can.gap, can.cellSize * i + can.headerHeight);
      ctx.lineTo(canvas.width - can.gap, can.cellSize * i + can.headerHeight);
      ctx.stroke();
    }
  },
  textHeader: (text) => {
    render.styleHeader();
    ctx.fillText(
      text,
      canvas.width / 2,
      can.headerHeight / 2,
      canvas.width - 2 * can.gap
    );
  },
  textFooter: (text) => {
    render.styleFooter();
    ctx.fillText(
      text,
      canvas.width - can.gap,
      canvas.height - can.footerHeight / 2,
      canvas.width - 2 * can.gap
    );
  },
  cross: (x, y, progress) => {
    //progress from 0 to 1
    const firstHalfProgress = progress > 0.5 ? 1 : progress * 2;
    const secondHalfProgress = progress > 0.5 ? progress * 2 - 1 : 0;
    render.crossFirst(x, y, firstHalfProgress);
    render.crossSecond(x, y, secondHalfProgress);
  },
  crossFirst: (x, y, progress) => {
    const [x0, y0] = [
      can.gap + can.cellSize * x,
      can.gap + can.headerHeight + can.cellSize * y,
    ];
    const [x1, y1] = [
      -can.gap + can.cellSize * (x + 1),
      -can.gap + can.headerHeight + can.cellSize * (y + 1),
    ];
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (x1 - x0) * +progress, y0 + (y1 - y0) * +progress);
    ctx.stroke();
  },
  crossSecond: (x, y, progress) => {
    const [x0, y0] = [
      can.gap + can.cellSize * x,
      -can.gap + can.headerHeight + can.cellSize * (y + 1),
    ];
    const [x1, y1] = [
      -can.gap + can.cellSize * (x + 1),
      can.gap + can.headerHeight + can.cellSize * y,
    ];
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (x1 - x0) * progress, y0 + (y1 - y0) * progress);
    ctx.stroke();
  },
  //
  circle: (x, y, progress) => {
    ctx.beginPath();
    ctx.arc(
      can.cellSize * (x + 1 / 2),
      can.cellSize * (y + 1 / 2) + can.headerHeight,
      can.cellSize * (1 / 2) - can.gap,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  },
  //анимированная рисовка
  сrossAnimated: (x, y) => {
    let t,
      tHalf = 0;
    tMax = 1000;
    requestAnimationFrame((x, y) => {
      tFirstHalf = t > tMax / 2 ? tMax / 2 : t;
      tSecondHalf = t > 500 / 2 ? 500 / 2 - t : 0;

      ctx.beginPath();
      ctx.moveTo(
        can.gap + can.cellSize * x,
        can.gap + can.headerHeight + can.cellSize * y
      );
      ctx.lineTo(
        (can.gap + can.cellSize * x) * (1 - tFirstHalf / tMax) +
          ((-can.gap + can.cellSize * (x + 1)) * tFirstHalf) / tMax,
        (can.gap + can.headerHeight + can.cellSize * y) *
          (1 - tFirstHalf / tMax) -
          (-can.gap + can.headerHeight + can.cellSize * (y + 1)) *
            (tFirstHalf / tMax)
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        can.gap + can.cellSize * x,
        -can.gap + can.headerHeight + can.cellSize * (y + 1)
      );
      ctx.lineTo(
        -can.gap + can.cellSize * (x + 1),
        can.gap + can.headerHeight + can.cellSize * y
      );
      ctx.stroke();

      if (t < tMax) {
        t += 1;
      }
    });
  },
};
//определение координат на canvas
function getCoordinates(canvas, event) {
  const windowInnerWidth = window.innerWidth;
  const aspectRatioY = canvas.width / windowInnerWidth;
  const rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  if (aspectRatioY > 1) {
    x *= aspectRatioY;
    y *= aspectRatioY;
  }
  return [x, y];
}
//отождествление координат ячейке игрового поля
function getCellCoordinates([x, y]) {
  if (
    (y > can.headerHeight || y < canvas.height - can.footerHeight) &&
    x < canvas.width &&
    y < canvas.height
  ) {
    const xCell = Math.trunc(x / can.cellSize);
    const yCell = Math.trunc((y - can.headerHeight) / can.cellSize);
    return [xCell, yCell];
  } else {
    return [undefined, undefined];
  }
}

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
    render.clear();
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
