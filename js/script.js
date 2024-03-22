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

  function calculatePossibleMoves(selectedPiece, board) {
    let moves = [];
    const player = selectedPiece.piece[1];
  
    switch (selectedPiece.piece[0]) {
      case PIECES.PAWN:
        moves = calculatePawnMoves(selectedPiece, board, player);
        break;
      case PIECES.ROOK:
        moves = calculateRookMoves(selectedPiece, board, player);
        break;
      case PIECES.KNIGHT:
        moves = calculateKnightMoves(selectedPiece, board, player);
        break;
      case PIECES.BISHOP:
        moves = calculateBishopMoves(selectedPiece, board, player);
        break;
      case PIECES.QUEEN:
        moves = calculateQueenMoves(selectedPiece, board, player);
        break;
      case PIECES.KING:
        moves = calculateKingMoves(selectedPiece, board, player);
        break;
      default:
        break;
    }
  
    return moves.filter(move => isMoveLegal(selectedPiece, move, board, player));
  }
  
  //Helper function to check if a move is legal (bounds check and collision detection)
  function isMoveLegal(selectedPiece, move, board, player) {
    //Check board boundaries
    if (move.row < 0 || move.row >= BOARD_SIZE || move.col < 0 || move.col >= BOARD_SIZE) return false;
    //Check for own piece at destination
    const destinationPiece = board[move.row][move.col];
    if (destinationPiece !== PIECES.EMPTY && destinationPiece[1] === player) return false;
    return true;
  }
  
  function calculatePawnMoves(selectedPiece, board, player) {

  }
  
  function calculateRookMoves(selectedPiece, board, player) {
    //check all four directions (up, down, left, right)
    const directions = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 },  // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }   // Right
      ];
      return calculateLinearMoves(selectedPiece, board, player, directions);
  }
  
  function calculateKnightMoves(selectedPiece, board, player) {
    //L-shaped moves
    const directions = [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 }
      ];
      directions.forEach(d => {
        const move = { row: selectedPiece.row + d.row, col: selectedPiece.col + d.col };
        if (isMoveLegal(selectedPiece, move, board, player)) {
          moves.push(move);
        }
      });
    
      return moves;
  }
  
  function calculateBishopMoves(selectedPiece, board, player) {
    //diagonal moves
    const directions = [
        { row: -1, col: -1 }, // Up-Left
        { row: -1, col: 1 },  // Up-Right
        { row: 1, col: -1 },  // Down-Left
        { row: 1, col: 1 }    // Down-Right
      ];
      return calculateLinearMoves(selectedPiece, board, player, directions);
  }
  
  function calculateQueenMoves(selectedPiece, board, player) {
    //combines the logic of both the rook and the bishop
    const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 }, 
        { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: -1, col: -1 }, { row: -1, col: 1 },
        { row: 1, col: -1 }, { row: 1, col: 1 }
      ];
      return calculateLinearMoves(selectedPiece, board, player, directions);
  }
  
  function calculateKingMoves(selectedPiece, board, player) {
    //moving one square in any direction
    const directions = [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 }, /* King's position */ { row: 0, col: 1 },
        { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
      ];
      directions.forEach(d => {
        const move = { row: selectedPiece.row + d.row, col: selectedPiece.col + d.col };
        if (isMoveLegal(selectedPiece, move, board, player)) {
          moves.push(move);
        }
      });
    
      return moves;
  }
  
  function calculateLinearMoves(selectedPiece, board, player, directions) {
    const moves = [];
  
    directions.forEach(d => {
      let row = selectedPiece.row + d.row;
      let col = selectedPiece.col + d.col;
      let hitPiece = false;
  
      while (!hitPiece && isMoveLegal(selectedPiece, { row, col }, board, player)) {
        moves.push({ row, col });
        if (board[row][col] !== PIECES.EMPTY) {
          hitPiece = true; //stop adding moves in this direction if we hit a piece
        }
        row += d.row;
        col += d.col;
      }
    });
  
    return moves;
  }