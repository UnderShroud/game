//переменные
const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const gameSize = document.querySelector(".game-size");
const other = document.getElementById("other");
const otherSize = document.querySelector(".other-size");
const buttonSubmit = document.querySelector(".submit");
const canvasWrapper = document.querySelector(".canvas-wrapper");
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
  // canvas.remove();
  // const newCanvas = document.createElement("canvas");
  // newCanvas.setAttribute("id", "canvas");
  // canvasWrapper.insertAdjacentElement("afterbegin", newCanvas);
  // canvas = document.getElementById("canvas");
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
  //функция для анимации
  const anime = async () => {
    let progress = 0;

    do {
      progress += 5 / 300;
      await delay(5);
      await currentPlayer.check(xCell, yCell, progress);
    } while (progress <= 1);
    //здесь могла быть анимация
    if (!game.isFinished) {
      render.currentState(game, players);
    }
    return new Promise((resolve, reject) => {
      resolve("");
    });
  };
  //если с ботом и у него первый ход
  if (players[game.currentTurn].constructor.name == "AI" && game.turn == 1) {
    currentPlayer = players[game.currentTurn];
    [xCell, yCell] = [
      Math.round((game.xCellSize - 1) * Math.random()),
      Math.round((game.yCellSize - 1) * Math.random()),
    ];
    game.state[xCell][yCell] = true;
    currentPlayer.state[xCell][yCell] = true;
    await anime();
    game.nextTurn();
    render.currentState(game, players);
  }
  //callback для нажатия
  const onClick = async (event) => {
    let playerTurn;
    let [x, y] = getCoordinates(canvas, event);
    let cell = getCellCoordinates([x, y]);
    [xCell, yCell] = cell;
    //если клик обоснован (игра идет, поле не закрашено)
    if (
      yCell === undefined ||
      game.state[xCell][yCell] ||
      game.isFinished ||
      players[game.currentTurn].constructor.name !== "Player"
    ) {
    } else {
      game.state[xCell][yCell] = true;
      currentPlayer = players[game.currentTurn];
      render.currentState(game, players);
      currentPlayer.state[xCell][yCell] = true;
      if (currentPlayer.checkWinner()) {
        currentPlayer.congratulation();
        game.isFinished = true;
        await anime();
        return;
      }
      game.nextTurn();
      //здесь могла быть анимация
      playerTurn = await anime();
    }

    //если с ботом, то он продолжает ход
    if (
      players[game.currentTurn].constructor.name == "AI" &&
      !game.isFinished
    ) {
      currentPlayer = players[game.currentTurn];
      [xCell, yCell] = currentPlayer.randomTurn(game);

      game.state[xCell][yCell] = true;
      render.currentState(game, players);
      currentPlayer.state[xCell][yCell] = true;
      if (currentPlayer.checkWinner()) {
        currentPlayer.congratulation();
        game.isFinished = true;
        await anime();
        return;
      }
      game.nextTurn();
      //здесь могла быть анимация
      await anime();
    }

    //ничья, если кончились ходы
    if (game.draw() && !game.isFinished) {
      render.clearHeader();
      render.clearFooter();
      render.textFooter(`Ход ${game.area}/${game.area}`);
      render.textHeader("Ничья!");
      game.isFinished = true;
      return;
    }
  };
  //чтение нажатия на canvas
  canvas.addEventListener("mousedown", onClick);
}
