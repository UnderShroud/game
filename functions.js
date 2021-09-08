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
  clearHeader: () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, can.headerHeight);
  },
  clearFooter: () => {
    ctx.fillStyle = "black";
    ctx.fillRect(
      0,
      canvas.height - can.footerHeight,
      canvas.width,
      can.footerHeight
    );
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
    if (!(secondHalfProgress == 0)) {
      render.crossSecond(x, y, secondHalfProgress);
    }
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
      2 * Math.PI * progress
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
//необходима для реализации асинхронности в перерисовке кадров
async function delay(time) {
  return await new Promise((resolve) => setTimeout(resolve, time));
}
