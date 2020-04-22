/** Connect Four
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
const board = []; // array of rows, each row is array of cells  (board[y][x])
let currPlayer; // active player: 1 or 2
let canClick = false;

newGame();

function newGame() {
  makeBoard();
  makeHtmlBoard();

  currPlayer = 1; // active player: 1 or 2
  let headerPlayer = document.getElementById("column-top");
  headerPlayer.setAttribute("class", ""); // ckear class
  headerPlayer.classList.add(currPlayer === 1 ? "column-top-p1" : "column-top-p2");

  canClick = true;
}

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */
function makeBoard() {
  board.push(new Array(HEIGHT));
  for (let i=0; i<HEIGHT; i++) {
    board[i] = new Array(WIDTH);
    board[i].fill(null);
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
  let htmlBoard = document.getElementById("board");
  htmlBoard.innerHTML = "";

  // add header row of table
  let top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // add HEIGHT rows for the play area
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
  if (!canClick) {
    return;
  }
  canClick = false;

  // get x from ID of clicked cell
  let x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    canClick = true;
    return;
  }

  // place piece in board and add to HTML table
  board[y][x] = currPlayer;

  placeInTable(y, x);
}
function continueClick() {
  // check for win
  if (checkForWin()) {
    setTimeout(function () { endGame(`Player ${currPlayer} won!`); }, 500);
  }
  // check for tie
  else if (board[0].every(function (value, index, array) {
    return value !== null;
  })) {
    setTimeout(function () { endGame(`Tie game`); }, 500);
  }
  // switch players
  else {
    currPlayer = (currPlayer === 1) ? 2 : 1;
    let headerPlayer = document.getElementById("column-top");
    headerPlayer.classList.toggle("column-top-p1");
    headerPlayer.classList.toggle("column-top-p2");
    canClick = true;
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
  if (board[0][x] !== null) {
    return null;
  }
  let row = HEIGHT - 1;
  while ((row > 0) && (board[row][x] !== null)) {
    row--;
  }
  return row;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
  let piece = document.createElement("div");
  piece.setAttribute("class", `piece p${currPlayer}`);

  let coord = (y + 1) * (50 + 2); // TODO: don't hard code spacing (cell/border sizes)
  piece.setAttribute("style", `position: relative; bottom: ${coord}px;`);

  document.getElementById(`${y}-${x}`).append(piece);

  const id = setInterval(function () {
    if (coord > 0) {
      coord--;
      piece.style.bottom = `${coord}px`;
    } else {
      clearInterval(id);
      continueClick();
    }
  }, 0);
}

/** endGame: announce game end */
function endGame(msg) {
  alert(msg);
  newGame();
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // TODO: optimize diagDL to remove minuses, keep all four coordinates in same 4x4 square (+0 to +3), then only need to loop to HEIGHT/WIDTH-4
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // set coordinates for four in a row in all directions
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      // if any group of coordinates are all current player, win!
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}
