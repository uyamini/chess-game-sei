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
let selectedPiece = null;
let possibleMoves = [];

/*----- cached elements  -----*/
const chessboardEl = document.getElementById('chessboard');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');
chessboardEl.addEventListener('click', handleSquareClick);

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
    const playerColor = currentPlayer === PLAYERS.WHITE ? "White" : "Black";
    messageEl.textContent = `${playerColor}'s Turn`;
    if (isInCheck(currentPlayer, board)) {
      messageEl.textContent += " - Check";
    }
  }
  
  init();

  function handleSquareClick(evt) {
    //Only respond to clicks on squares
    if (!evt.target.classList.contains('square')) return;
  
    const clickedPos = evt.target.dataset.position.split('-').map(Number);
    const [row, col] = clickedPos;
  
    if (selectedPiece) {
      //Attempt to move the selected piece to the clicked square
      makeMove(selectedPiece, row, col);
    } else {
      //Select the piece
      selectPiece(row, col);
    }
  }

  function selectPiece(row, col) {
    //TO DO: slection and move validation logic implementation
    const piece = board[row][col];
    if (piece !== PIECES.EMPTY) {
      console.log(`Selected piece: ${piece}`);
      selectedPiece = { row, col, piece };
      // TODO: Calculate possible moves
      possibleMoves = calculatePossibleMoves(selectedPiece);
      // TODO: Highlight possible moves
      highlightPossibleMoves(possibleMoves);
    }
  }
  function highlightPossibleMoves(moves) {
    //Clear previous highlights
    document.querySelectorAll('.possible-move').forEach(el => el.classList.remove('possible-move'));
  
    moves.forEach(move => {
      const square = document.querySelector(`[data-position="${move.row}-${move.col}"]`);
      if (square) {
        square.classList.add('possible-move');
      }
    });
  }
  
  function makeMove(selectedPiece, targetRow, targetCol) {
    //Move the piece if the target square is a possible move
    if (possibleMoves.some(pos => pos.row === targetRow && pos.col === targetCol)) {
      //TO DO: implement the move logic and state updates here
      console.log(`Moved ${selectedPiece.piece} to ${targetRow}-${targetCol}`);
      board[targetRow][targetCol] = selectedPiece.piece; //Place piece on the target square
      board[selectedPiece.row][selectedPiece.col] = PIECES.EMPTY; //Clear the original square
      selectedPiece = null; //Deselect the piece
      possibleMoves = []; //Clear possible moves
      currentPlayer = currentPlayer === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE; // Switch turns
      render(); //Re-render the board to show the updated state
    }
  }
  
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
    const moves = [];
  const direction = player === PLAYERS.WHITE ? -1 : 1; //Pawns move up for White, down for Black
  const startRow = player === PLAYERS.WHITE ? 6 : 1; //Starting row for double move
  const opponent = player === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE;

  //Single square forward
  if (board[selectedPiece.row + direction][selectedPiece.col] === PIECES.EMPTY) {
    moves.push({ row: selectedPiece.row + direction, col: selectedPiece.col });

    //Double square forward from starting position
    if (selectedPiece.row === startRow && board[selectedPiece.row + (2 * direction)][selectedPiece.col] === PIECES.EMPTY) {
      moves.push({ row: selectedPiece.row + (2 * direction), col: selectedPiece.col });
    }
  }

  //Captures
  const potentialCaptures = [
    { row: selectedPiece.row + direction, col: selectedPiece.col - 1 },
    { row: selectedPiece.row + direction, col: selectedPiece.col + 1 }
  ];

  potentialCaptures.forEach(move => {
    if (move.col >= 0 && move.col < BOARD_SIZE && board[move.row][move.col][1] === opponent) {
      moves.push(move);
    }
  });

  //TO DO: En passant logic will need to be implemented here
  return moves;
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

  function isInCheck(player, board) {
    //Find the king's position
    let kingPosition;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === (PIECES.KING + player)) {
          kingPosition = { row, col };
          break;
        }
      }
      if (kingPosition) break;
    }
  
    //Check if any opposing piece can capture the king
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== PIECES.EMPTY && piece[1] !== player) {
          const moves = calculatePossibleMoves({ row, col, piece }, board);
          if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true; //King is in check
          }
        }
      }
    }
  
    return false;
  }

  function isCheckmate(player, board) {
    if (!isInCheck(player, board)) return false; //Not in checkmate if not in check
  
    //Try all moves for all pieces to see if check can be escaped
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece[1] === player) {
          const moves = calculatePossibleMoves({ row, col, piece }, board);
          for (let move of moves) {
            const newBoard = JSON.parse(JSON.stringify(board)); //Deep copy the board
            // Simulate the move
            newBoard[move.row][move.col] = piece;
            newBoard[row][col] = PIECES.EMPTY;
            if (!isInCheck(player, newBoard)) return false; //Found a move to escape check
          }
        }
      }
    }
  
    return true; //No legal moves to escape check, thus checkmate
  }
  