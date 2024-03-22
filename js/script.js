/*----- constants -----*/
const BOARD_SIZE = 8;
const PIECES = {
  EMPTY: ' ',
  PAWN: 'P',
  ROOK: 'R',
  KNIGHT: 'N',
  BISHOP: 'B',
  QUEEN: 'Q',
  KING: 'K',
};
const PLAYERS = {
  WHITE: 'W',
  BLACK: 'B',
};

/*----- state variables -----*/
let board;
let currentPlayer;
let gameActive;

/*----- cached elements  -----*/
const chessboardEl = document.getElementById('chessboard');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');

/*----- event listeners -----*/
resetBtn.addEventListener('click', init);

/*----- functions -----*/
function init() {
    board = createInitialBoard();
    currentPlayer = PLAYERS.WHITE;
    gameActive = true;
    render();
  }