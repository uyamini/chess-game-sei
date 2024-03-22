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
    chessboardEl.innerHTML = ''; // Clear the board for a fresh render
  
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = document.createElement('div');
        square.className = 'square ' + ((row + col) % 2 ? 'dark' : 'light'); // Alternating colors
        square.dataset.position = `${row}-${col}`;
  
        const piece = board[row][col];
        if (piece !== PIECES.EMPTY) {
          const color = piece[1] === PLAYERS.WHITE ? 'W' : 'B';
          let svgMarkup = '';
  
          //Select the correct SVG based on the piece type
          switch (piece[0]) {
            case PIECES.KING:
              svgMarkup = king;
              break;
            case PIECES.QUEEN:
              svgMarkup = queen;
              break;
            case PIECES.ROOK:
              svgMarkup = rook;
              break;
            case PIECES.BISHOP:
              svgMarkup = bishop;
              break;
            case PIECES.KNIGHT:
              svgMarkup = knight;
              break;
            case PIECES.PAWN:
              svgMarkup = pawn;
              break;
            default:
              break;
          }
  
          // Add class to distinguish color
          svgMarkup = svgMarkup.replace('<div class="piece"', `<div class="piece ${color}"`);
          
          // Set the inner HTML of the square to the SVG markup
          square.innerHTML = svgMarkup;
        }
  
        chessboardEl.appendChild(square);
      }
    }
  
    // After rendering the board and pieces
document.querySelectorAll('.piece').forEach(piece => {
    piece.setAttribute('draggable', true);
});

    highlightPossibleMoves(possibleMoves); //Re-highlight possible moves after rendering
    updateMessage(); //Update game status message
}

function updateMessage() {
    if (!gameActive) {
        // Game over conditions
        if (isCheckmate(currentPlayer)) {
            celebrateVictory();
            messageEl.textContent = `${currentPlayer === PLAYERS.WHITE ? 'Black' : 'White'} wins by checkmate! Game Over.`;
        } else if (isStalemate(currentPlayer)) {
            messageEl.textContent = "Stalemate! Game Over.";
        } else {
            messageEl.textContent = "Game Over.";
        }
    } else {
        // Game is still active
        const playerColor = currentPlayer === PLAYERS.WHITE ? "White" : "Black";
        messageEl.textContent = `${playerColor}'s Turn`;

        // Check for check state
        if (isInCheck(currentPlayer)) {
            messageEl.textContent += " - Check";
        }
    }
}


  init();
  
//Handle drag start
function handleDragStart(e) {
    let targetElement = e.target;

    // Check if the event target is part of an SVG and find the parent element with the dataset
    while (targetElement && !targetElement.dataset.position) {
        targetElement = targetElement.closest('.square');
    }

    if (!targetElement) {
        console.error('Unable to find the square for the dragged piece.');
        e.preventDefault();
        return;
    }

    const [row, col] = targetElement.dataset.position.split('-').map(Number);
    const piece = board[row][col];
    if (piece === PIECES.EMPTY || piece[1] !== currentPlayer) {
        e.preventDefault(); // Prevent drag if it's not the correct player's turn or the square is empty
        return;
    }

    // If the piece is valid, store its position for the drop event
    e.dataTransfer.setData('text/plain', targetElement.dataset.position);
    selectPiece(row, col); // Optional: Highlight the piece or show possible moves
}


//Allow dropping by preventing the default handling of the event
function handleDragOver(e) {
    e.preventDefault();
}

//Handle drop to move piece
function handleDrop(e) {
    e.preventDefault();

    const originalPosition = e.dataTransfer.getData('text/plain');
    if (!originalPosition) return; // Exit if no position data is found

    const [startRow, startCol] = originalPosition.split('-').map(Number);
    let targetSquare = e.target;

    // Ensure we have the drop target as the square, not an SVG element
    while (targetSquare && !targetSquare.dataset.position) {
        targetSquare = targetSquare.closest('.square');
    }

    if (!targetSquare) {
        console.error('Drop target is not a valid square.');
        return;
    }

    const [endRow, endCol] = targetSquare.dataset.position.split('-').map(Number);

    // Attempt to move the piece
    makeMove({ row: startRow, col: startCol, piece: board[startRow][startCol] }, endRow, endCol);
}



//Simulate Move Function (New Addition)
function simulateMove(board, startRow, startCol, endRow, endCol) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[startRow][startCol];
    newBoard[endRow][endCol] = piece;
    newBoard[startRow][startCol] = PIECES.EMPTY;
    return newBoard;
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
    // Log board state before the move
    console.log(`Board state before move:`, board.map(row => row.join(", ")).join("\n"));
    console.log(`Moving piece from ${selectedPiece.row},${selectedPiece.col} to ${targetRow},${targetCol}`);

    if (!selectedPiece || board[targetRow][targetCol] && board[targetRow][targetCol][1] === currentPlayer) {
        console.error("Invalid move");
        return;
    }
    
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
      currentPlayer = currentPlayer === PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE; //Switch turns

      console.log("Board state before isInCheck:", board.map(row => row.join(",")).join("\n"));

      // Check for game conditions
    if (isInCheck(currentPlayer, board)) {

        if (isCheckmate(currentPlayer)) {
            console.log(`${currentPlayer} is in checkmate. Game over.`);
            gameActive = false;
            updateMessage(`${currentPlayer} is in checkmate. Game over.`);
            return;
        } else {
            console.log(`${currentPlayer} is in check.`);
            updateMessage(`${currentPlayer} is in check.`);
        }
    } else if (isStalemate(currentPlayer, board)) {
        console.log(`Stalemate. Game over.`);
        gameActive = false;
        updateMessage(`Stalemate. Game over.`);
        return;
    }

      render(); //Re-render the board to reflect the new state
    } else {
      //If the move isn't valid, deselect the piece and clear possible moves
      selectedPiece = null;
      possibleMoves = [];
      highlightPossibleMoves([]); // Clear highlighted moves
    }
    // After move logic, log the board state
    console.log(`Board state after move:`, board.map(row => row.join(", ")).join("\n"));
    // Specifically check if the black king is present
    const blackKingPos = findKingPosition(PLAYERS.BLACK, board);
    if (!blackKingPos) {
        console.error("Black king position lost after move");
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
    let moves = [];
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
    let moves = [];
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

  function isInCheck(player) {
    const kingPosition = findKingPosition(player);
    if (!kingPosition) {
        console.error("King not found, which should never happen.");
        return false;
    }
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece !== PIECES.EMPTY && piece[1] !== player) {
                const moves = calculatePossibleMoves({ row, col, piece }, board);
                for (const move of moves) {
                    if (move.row === kingPosition.row && move.col === kingPosition.col) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

  

  function findKingPosition(player) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === PIECES.KING + player) {
          return { row, col };
        }
      }
    }
    return null; // Should not happen if a game is correctly initialized
  }


  function isCheckmate(player) {
    if (!isInCheck(player)) return false;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece[1] === player) {
                const moves = calculatePossibleMoves({ row, col, piece }, board);
                for (const move of moves) {
                    const simulatedBoard = simulateMove(board, row, col, move.row, move.col);
                    if (!isInCheck(player, simulatedBoard)) {
                        return false; // There's a move that gets the player out of check
                    }
                }
            }
        }
    }
    return true; // No moves get the player out of check
}


  function isStalemate(player) {
    if (isInCheck(player, board)) return false; // Can't be stalemate if in check
  
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col][1] === player) {
          const possibleMoves = calculatePossibleMoves({ row, col, piece: board[row][col] }, board);
          for (const move of possibleMoves) {
            const simulatedBoard = simulateMove(board, row, col, move.row, move.col);
            if (!isInCheck(player, simulatedBoard)) {
              return false; // Found a legal move
            }
          }
        }
      }
    }
    return true; // No legal moves available, stalemate
  }

function hasLegalMoves(row, col, board) {
    const piece = board[row][col];
    const player = piece[1];
    
    // Calculate possible moves for the piece
    const possibleMoves = calculatePossibleMoves({ row, col, piece }, board);
    
    // Iterate over possible moves and check if any move is legal
    for (const move of possibleMoves) {
        const simulatedBoard = simulateMove(board, row, col, move.row, move.col);
        
        // If making the move doesn't put the player's king in check, it's a legal move
        if (!isInCheck(player, simulatedBoard)) {
            return true;
        }
    }
    
    // If no legal moves found for the piece, return false
    return false;
}

function celebrateVictory() {
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti');
    document.body.appendChild(confettiContainer);
  
    for (let i = 0; i < 100; i++) {
      createConfettiPiece(confettiContainer);
    }
  
    // Remove confetti after 5 seconds
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }
  
  function createConfettiPiece(container) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    container.appendChild(confetti);
  
    // Random position within the container
    const xPos = Math.floor(Math.random() * window.innerWidth);
    const yPos = Math.floor(Math.random() * window.innerHeight);
    confetti.style.left = `${xPos}px`;
    confetti.style.top = `${yPos}px`;
  
    // Animation
    confetti.animate([
      { transform: 'scale(0)', opacity: 0.7 },
      { transform: 'scale(1)', opacity: 0.7, offset: 0.2 },
      { transform: 'scale(0)', opacity: 0, offset: 1 }
    ], {
      duration: 3000,
      easing: 'ease-out'
    });
  }
  