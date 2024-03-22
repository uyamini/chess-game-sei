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

  function createInitialBoard() {
    // Initialize an 8x8 board with empty spaces
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PIECES.EMPTY));
  
    // Black pieces
    initialBoard[0][0] = PIECES.ROOK + PLAYERS.BLACK;
    initialBoard[0][1] = PIECES.KNIGHT + PLAYERS.BLACK;
    initialBoard[0][2] = PIECES.BISHOP + PLAYERS.BLACK;
    initialBoard[0][3] = PIECES.QUEEN + PLAYERS.BLACK;
    initialBoard[0][4] = PIECES.KING + PLAYERS.BLACK;
    initialBoard[0][5] = PIECES.BISHOP + PLAYERS.BLACK;
    initialBoard[0][6] = PIECES.KNIGHT + PLAYERS.BLACK;
    initialBoard[0][7] = PIECES.ROOK + PLAYERS.BLACK;
  
    // Black pawns
    for (let i = 0; i < BOARD_SIZE; i++) {
      initialBoard[1][i] = PIECES.PAWN + PLAYERS.BLACK;
    }
  
    // White pawns
    for (let i = 0; i < BOARD_SIZE; i++) {
      initialBoard[6][i] = PIECES.PAWN + PLAYERS.WHITE;
    }
  
    // White pieces
    initialBoard[7][0] = PIECES.ROOK + PLAYERS.WHITE;
    initialBoard[7][1] = PIECES.KNIGHT + PLAYERS.WHITE;
    initialBoard[7][2] = PIECES.BISHOP + PLAYERS.WHITE;
    initialBoard[7][3] = PIECES.QUEEN + PLAYERS.WHITE;
    initialBoard[7][4] = PIECES.KING + PLAYERS.WHITE;
    initialBoard[7][5] = PIECES.BISHOP + PLAYERS.WHITE;
    initialBoard[7][6] = PIECES.KNIGHT + PLAYERS.WHITE;
    initialBoard[7][7] = PIECES.ROOK + PLAYERS.WHITE;
  
    return initialBoard;
  }
  
  function render() {
    chessboardEl.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = document.createElement('div');
        square.className = 'square ' + ((row + col) % 2 ? 'dark' : 'light');
        square.textContent = board[row][col][0]; //Temporarily displays the first letter of the piece
        square.dataset.position = `${row}-${col}`;
        chessboardEl.appendChild(square);
      }
    }
    updateMessage();
  }

  function updateMessage() {
    messageEl.textContent = currentPlayer === PLAYERS.WHITE ? "White's turn" : "Black's turn";
    if (!gameActive) {
      messageEl.textContent = currentPlayer === PLAYERS.WHITE ? "Black wins!" : "White wins!";
    }
  }
  
  init();