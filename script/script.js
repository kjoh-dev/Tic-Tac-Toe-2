/*
** The Gameboard represents the state of the board.
** Each square holds a Cell
** and we expose a drawSymbol method to add Cells to squares.
*/

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];
    let unmarkedCells = 0;

    // Create a 2d array that will represent the state of the game board.
    // Row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for (let i =  0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
            unmarkedCells++;
        }
    }

    // This method will get the entire board that the UI will use to render.
    const getBoard = () => board;

    const getRows = () => rows;
    const getColumns = () => columns;

    // In order to draw a symbol, we need to get the Cell
    // and check whether the Cell has already been marked by a symbol.
    const drawSymbol = (x, y, player) => {
        let cell = getCellAt(x, y);
        if(cell.getValue() === 0) {
            cell.addSymbol(player);
            unmarkedCells--;
        }
    }

    // This method will be used to print our board to the console.
    // Will not be needed after UI is implemented.
    const printBoard = () => {
        let printedBoard = "<Board>";
        for (let i =  0; i < rows; i++) {
            printedBoard += "\n";
            for (let j = 0; j < columns; j++) {
                printedBoard = printedBoard + " " + board[i][j].getValue();
            }
        }
        console.log(printedBoard);
    }

    const getCellAt = (x, y) => {
        return board[y][x];
    };

    const getUnmarkedCounts = () => unmarkedCells;

    return { getBoard, drawSymbol, printBoard, getUnmarkedCounts, getRows, getColumns };
}

/*
** A Cell represents one "square" on the baord
** and can be in one of the following states:
** 0: no symbol marked on the square,
** 1: Player 1's symbol,
** 2: Player 2's symbol.
*/

function Cell(){
    let value = 0;

    // Accept a player's symbol to change the value of the Cell.
    const addSymbol = (player) => {
        value = player;
    };

    // Method for retrieving the current Cell value using closure.
    const getValue = () => value;

    return {
        addSymbol,
        getValue
    };
}

/* 
** The GameController is reposible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game.
*/

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const gameBoard = Gameboard();
    const players = [
        {
            name: playerOneName,
            symbol: 1
        },
        {
            name: playerTwoName,
            symbol: 2
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] :
        players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        gameBoard.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const printGameover = (gameState) => {
        gameBoard.printBoard();
        if (gameState === "TIE") console.log(`It's a ${gameState}!`);
        else console.log(`${getActivePlayer().name} has WON!`);
    };

    const playRound = (x, y) => {
        console.log(`Marking ${getActivePlayer().name}'s symbol, ${getActivePlayer().symbol} into square at position, x:${x} y:${y}`);
        gameBoard.drawSymbol(x, y, getActivePlayer().symbol);

        // Check for winner and so forth. 
        // If not, proceed to next turn.
        const gameState = checkGameState(x,y);
        if (gameState === "WIN" || gameState === "TIE"){
            printGameover(gameState);
        } else {
            switchPlayerTurn();
            printNewRound();
        }
    };

    const checkGameState = (xLast, yLast) => {
        const board = gameBoard.getBoard();
        const currentSymbol = getActivePlayer().symbol;
        const rows = gameBoard.getRows();
        const columns = gameBoard.getColumns();
        
        // Look for a "HORIZONTAL" win state on the row of last player input.
        let symbolCount = 0;
        for (let j = 0; j < columns; j++) {
            if(board[yLast][j].getValue() === currentSymbol) symbolCount++;
        }
        if (symbolCount === 3) return "WIN";
        
        // Look for "VERTICAL" win state.
        symbolCount = 0;
        for (let i = 0; i < rows; i++) {
            if(board[i][xLast].getValue() === currentSymbol) symbolCount++;
        }
        if (symbolCount === 3) return "WIN";
        
        // Look for "DIAGONAL" win state.
        const isCenterCell = (xLast === yLast && xLast === 1);
        
        // Look for (\) "DIAGONAL" win state.
        symbolCount = 0;
        if(isCenterCell || xLast === yLast){
            for (let i =  0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (i === j && board[i][j].getValue() === currentSymbol) symbolCount++;
                }
            }
            if (symbolCount === 3) return "WIN";
        }

        // Look for (/) "DIAGONAL" win state.
        symbolCount = 0;
        if(isCenterCell || xLast+yLast === 2){
            for (let i =  0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (i + j === 2 && board[i][j].getValue() === currentSymbol) symbolCount++;
                }
            }
            if (symbolCount === 3) return "WIN";
        }

        // Look for unmarked space. 
        // If none, return "TIE" state. 
        // If found, return "ONGOING" state.
        if (gameBoard.getUnmarkedCounts === 0) return "TIE";
    }

    // Initialization at game start
    printNewRound();

    return {
        playRound,
        getActivePlayer,
        checkGameState
    };

}

const game = GameController();