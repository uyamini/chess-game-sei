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
document.getElementById('reset').addEventListener('click', init);
chessboardEl.addEventListener('dragstart', handleDragStart, false);
chessboardEl.addEventListener('dragover', handleDragOver, false);
chessboardEl.addEventListener('drop', handleDrop, false);

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
    chessboardEl.innerHTML = ''; //Clear the board for a fresh render
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            //Create each square
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 ? 'dark' : 'light'); //Alternating colors
            square.dataset.position = `${row}-${col}`;
            square.setAttribute('draggable', false); //Default to not draggable
            
            const piece = board[row][col];
            if (piece !== PIECES.EMPTY) {
                //Create a span element to hold the piece character or image
                const pieceElement = document.createElement('span');
                pieceElement.className = `chess-piece ${piece}`;
                pieceElement.textContent = piece[0]; //Placeholder for the piece character
                pieceElement.dataset.piece = piece; //Custom data attribute to identify the piece
                
                //Make pieces draggable
                if (piece[1] === currentPlayer) {
                    pieceElement.setAttribute('draggable', true);
                    pieceElement.addEventListener('dragstart', handleDragStart);
                }

                square.appendChild(pieceElement);
            }
            
            //Drop event listener to allow moving pieces
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);

            chessboardEl.appendChild(square);
        }
    }
    highlightPossibleMoves(possibleMoves); //Re-highlight possible moves after rendering
    updateMessage(); //Update game status message
}


  function updateMessage() {
    const playerColor = currentPlayer === PLAYERS.WHITE ? "White" : "Black";
    messageEl.textContent = `${playerColor}'s Turn`;
    if (isInCheck(currentPlayer, board)) {
      messageEl.textContent += " - Check";
    }
  }
  
  init();
  
//Handle drag start
function handleDragStart(e) {
    const position = e.target.closest('.square').dataset.position;
    e.dataTransfer.setData('text/plain', position);
    const [row, col] = position.split('-').map(Number);
    selectPiece(row, col); //This will set the selectedPiece and calculate possible moves
}

//Allow dropping by preventing the default handling of the event
function handleDragOver(e) {
    e.preventDefault();
}

//Handle drop to move piece
function handleDrop(e) {
    e.preventDefault();
    const targetSquare = e.target.closest('.square');
    const newPosition = targetSquare.dataset.position;
    const originalPosition = e.dataTransfer.getData('text/plain');

    if (!newPosition || !originalPosition || newPosition === originalPosition) {
        return; //Invalid drop or no movement
    }

    const [startRow, startCol] = originalPosition.split('-').map(Number);
    const [endRow, endCol] = newPosition.split('-').map(Number);

    //Only move if it's among the calculated possible moves
    if (possibleMoves.find(move => move.row === endRow && move.col === endCol)) {
        makeMove({row: startRow, col: startCol, piece: board[startRow][startCol]}, endRow, endCol);
    }
}


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
    const piece = board[row][col];
    if (piece !== PIECES.EMPTY && piece[1] === currentPlayer) {
        selectedPiece = { row, col, piece };
        possibleMoves = calculatePossibleMoves(selectedPiece, board);
        highlightPossibleMoves(possibleMoves);
    } else {
        selectedPiece = null;
        possibleMoves = [];
        highlightPossibleMoves([]); // Clear any highlighted moves
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
    // Validate the move is within the calculated possible moves
    if (possibleMoves.some(pos => pos.row === targetRow && pos.col === targetCol)) {
      // Execute the move
      board[targetRow][targetCol] = selectedPiece.piece; // Move the piece
      board[selectedPiece.row][selectedPiece.col] = PIECES.EMPTY; // Clear the original square
  
      // Handle special rules like pawn promotion
      if (selectedPiece.piece[0] === PIECES.PAWN && (targetRow === 0 || targetRow === BOARD_SIZE - 1)) {
        // Simplified pawn promotion to Queen
        board[targetRow][targetCol] = PIECES.QUEEN + selectedPiece.piece[1];
      }
  
      selectedPiece = null; // Clear the selection
      possibleMoves = []; // Clear possible moves
      currentPlayer = currentPlayer === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE; // Switch turns
  
      render(); // Re-render the board to reflect the new state
    } else {
      // If the move isn't valid, deselect the piece and clear possible moves
      selectedPiece = null;
      possibleMoves = [];
      highlightPossibleMoves([]); // Clear highlighted moves
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
  