/*
** The Gameboard represents the state of the board.
** Each square holds a Cell
** and we expose a drawSymbol method to add Cells to squares.
*/

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create a 2d array that will represent the state of the game board.
    // Row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for (let i =  0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    // This method will get the entire board that the UI will use to render.
    const getBoard = () => board;

    // In order to draw a symbol, we need to get the Cell
    // and check whether the Cell has already been marked by a symbol.
    const drawSymbol = (Cell, player) => {
        if(Cell.getValue() === 0) Cell.addSymbol(player);
    }

    // This method will be used to print our board to the console.
    // Will not be needed after UI is implemented.
    const printBoard = () => {
        console.log(board);
    }

    return { getBoard, drawSymbol, printBoard };
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
    const board = Gameboard();
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
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (Cell) => {
        console.log(`Marking ${getActivePlayer().name}'s symbol into square`);
        board.drawSymbol(Cell, getActivePlayer().symbol);

        // Check for winner and so forth. 
        // If not, proceed to next turn.

        switchPlayerTurn();
        printNewRound();
    };

    // Initialization at game start
    printNewRound();

    return {
        playRound,
        getActivePlayer
    };

}

const game = GameController();