/*
** The Gameboard represents the state of the board.
** Each square holds a Cell
** and we expose a drawSymbol method to add Cells to squares.
*/

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];
    let unmarkedCells = rows * columns;

    // Create a 2d array that will represent the state of the game board.
    // Row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for (let i =  0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell(i*3+j));
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
        if(cell.getValue() === "") {
            cell.addSymbol(player);
            unmarkedCells--;
        }
    }

    const resetBoard = () => {
        for (let i =  0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                getCellAt(j, i).addSymbol();
            }
        }

        unmarkedCells = rows * columns;
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
    }

    const getCellAt = (x, y) => {
        return board[y][x];
    };

    const getUnmarkedCounts = () => unmarkedCells;

    return { getBoard, drawSymbol, resetBoard, printBoard, getUnmarkedCounts, getRows, getColumns };
}

/*
** A Cell represents one "square" on the baord
** and can be in one of the following states:
** 0: no symbol marked on the square,
** 1: Player 1's symbol,
** 2: Player 2's symbol.
*/

function Cell(idNumber){
    const cellElem = document.getElementById("cell-" + idNumber);
    cellElem.addEventListener("click", markCell);

    // Accept a player's symbol to change the value of the Cell.
    const addSymbol = (player = "") => {
        cellElem.innerText = player;
    };

    // Method for retrieving the current Cell value using closure.
    const getValue = () => cellElem.innerText;

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

function GameController() {

    let difficulty;
    let gameBoard;
    let board;
    let rows;
    let columns;
    let aiDelayTime = 1000;
    let players;
    let activePlayer;
    let isBoardLocked;
    const playButton = document.getElementById("play-button");
    const xPlayerButton = document.getElementById("x-name");
    const oPlayerButton = document.getElementById("o-name");
    const announcer = document.getElementById("announcer");

    const checkBoardState = () => {
        return isBoardLocked;
    };

    const setPlayers = () => {
        players = [
            {
                name: xPlayerButton.textContent.replace("--> ","").trim(),
                symbol: "X"
            },
            {
                name: oPlayerButton.textContent.replace("--> ","").trim(),
                symbol: "O"
            }
        ];
        activePlayer = players[0];
    };

    const setDifficulty = (difficulty = "Hard") => {
        this.difficulty = difficulty;
    };

    const initGame = () => {
        gameBoard = Gameboard();
        board = gameBoard.getBoard();
        rows = gameBoard.getRows();
        columns = gameBoard.getColumns();

        setPlayers();
        setDifficulty();

        isBoardLocked = true;
        playButton.addEventListener("click", playGame, { once: true });
        xPlayerButton.addEventListener("click", togglePlayerType);
        oPlayerButton.addEventListener("click", togglePlayerType);
    };

    const togglePlayerType = (e) => {
        const elem = e.target;
        if(!(elem instanceof Element)) return;

        elem.textContent = elem.textContent === "--> Player" ? "--> Bot" : "--> Player";
    };

    const resetGame = () => {
        gameBoard.resetBoard();

    };
    
    const startGame = (difficulty) => {
        setPlayers();
        setDifficulty(difficulty);
        playButton.style.display = "none";
        playButton.addEventListener("click", newGame, { once: true });
        xPlayerButton.style.cursor = "default";
        oPlayerButton.style.cursor = "default";
        xPlayerButton.removeEventListener("click", togglePlayerType);
        oPlayerButton.removeEventListener("click", togglePlayerType);

        printNewRound();

        isBoardLocked = getActivePlayer() === "Bot" ? true : false;
        if(getActivePlayer().name === "Bot") AIPlayRound(difficulty);
    };

    const switchPlayerTurn = () => {
        activePlayer = activePlayer.symbol === players[0].symbol ? players[1] :
        players[0];
        if (activePlayer.name === "Bot"){
            isBoardLocked = true;
            setTimeout(() => { AIPlayRound(difficulty); }, aiDelayTime);
        } else {
            isBoardLocked = false;
        }
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        gameBoard.printBoard();
        announce(`${getActivePlayer().name}-${getActivePlayer().symbol}'s turn.`);
    };

    const printGameover = (gameState) => {
        gameBoard.printBoard();
        if (gameState === "TIE") {
            announce(`It's a ${gameState}!`);
        }
        else {
            announce(`${getActivePlayer().name}-${getActivePlayer().symbol} has WON!`);
        } 
        playButton.textContent = "Again?";

        playButton.style.display = "block";
        xPlayerButton.style.cursor = "pointer";
        oPlayerButton.style.cursor = "pointer";

    };

    const announce = (announcement) => {
        announcer.textContent = announcement;
    };

    const playRound = (cellID) => {
        const id = typeof cellID === "string" ? Number(cellID.slice(-1)) : cellID;
        const x = id % 3;
        const y = Math.trunc(id / 3);

        gameBoard.drawSymbol(x, y, getActivePlayer().symbol);

        // Check for winner and so forth. 
        // If not, proceed to next turn.
        const gameState = checkGameState(x,y);
        if (gameState !== "ONGOING"){
            isBoardLocked = true;
            printGameover(gameState);
            playButton.style.display = "block";
            xPlayerButton.addEventListener("click", togglePlayerType);
            oPlayerButton.addEventListener("click", togglePlayerType);
        } else {
            switchPlayerTurn();
            printNewRound();

        }
    };

    const AIPlayRound = (difficulty) => {
        const selectedXY = [];
        switch (difficulty){
            case "Easy":{
                    const unmarkedCells = getUnmarkedCells();
                    const selectedCell = unmarkedCells[Math.floor(Math.random() * unmarkedCells.length)];
                    selectedXY[0] = selectedCell.x;
                    selectedXY[1] = selectedCell.y;
                }
                break;
            case "Hard":
            default:{
                const AIMark = players[0].name === activePlayer.name ? "oneMarked" : "twoMarked";
                const oppMark = AIMark === "twoMarked" ? "oneMarked" : "twoMarked";
                let result;
                const resultDefense = [];
                
                // Check for a winning move (two own symbols in line)
                if(selectedXY.length === 0){
                    for (let y = 0; y < rows; y++){
                        result = checkRow(y);
    
                        if(result.unmarked.length === 1 && result[AIMark].length === 2) {
                            selectedXY[0] = result.unmarked[0].x;
                            selectedXY[1] = result.unmarked[0].y;
                            break;
                        }
                        if(result.unmarked.length === 1 && result[oppMark].length === 2) {
                            resultDefense.push(result.unmarked[0]);
                        }
                    }
                }

                if(selectedXY.length === 0){
                    for (let x = 0; x < columns; x++){
                        result = checkColumn(x);
    
                        if(result.unmarked.length === 1 && result[AIMark].length === 2) {
                            selectedXY[0] = result.unmarked[0].x;
                            selectedXY[1] = result.unmarked[0].y;
                            break;
                        }
                        if(result.unmarked.length === 1 && result[oppMark].length === 2) {
                            resultDefense.push(result.unmarked[0]);
                        }
                    }
                }

                if(selectedXY.length === 0){
                    result = checkDiagonalFwd();

                    if(result.unmarked.length === 1 && result[AIMark].length === 2) {
                        selectedXY[0] = result.unmarked[0].x;
                        selectedXY[1] = result.unmarked[0].y;
                        break;
                    }
                    if(result.unmarked.length === 1 && result[oppMark].length === 2) {
                        resultDefense.push(result.unmarked[0]);
                    }
                }

                if(selectedXY.length === 0){
                    result = checkDiagonalBwd();

                    if(result.unmarked.length === 1 && result[AIMark].length === 2) {
                        selectedXY[0] = result.unmarked[0].x;
                        selectedXY[1] = result.unmarked[0].y;
                        break;
                    }
                    if(result.unmarked.length === 1 && result[oppMark].length === 2) {
                        resultDefense.push(result.unmarked[0]);
                    }
                }

                if(selectedXY.length !== 0) break;

                // Check for a losing move (two opponent symbols in line)
                if(resultDefense.length > 0){
                    if(resultDefense.some((cell) => cell.x === 1 && cell.y === 1)){
                        selectedXY[0] = 1;
                        selectedXY[1] = 1;
                    } else {
                        selectedXY[0] = resultDefense[0].x;
                        selectedXY[1] = resultDefense[0].y;
                    }

                    break;
                }

                // Check for center and Check for corners if necessary
                const unmarkedCells = getUnmarkedCells();
                if(unmarkedCells.some((cell) => cell.x === 1 && cell.y === 1)){
                    selectedXY[0] = 1;
                    selectedXY[1] = 1;
                } else {
                    for (let i = 0; i < unmarkedCells.length; i++){
                        selectedXY[0] = unmarkedCells[i].x;
                        selectedXY[1] = unmarkedCells[i].y;

                        if(selectedXY[0] === selectedXY[1]) break;
                        if(selectedXY[0] + selectedXY[1] === 2) break;
                    }
                }

            }
            break;
        }
        playRound(selectedXY[1] * 3 + selectedXY[0])
    }

    const getUnmarkedCells = () => {
        const unmarkedCells = [];
        for (let i =  0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (board[i][j].getValue() === "") unmarkedCells.push({ x: j, y: i });
            }
        }
        return unmarkedCells;
    }

    const checkRow = (y) => {
        const unmarked = [];
        const oneMarked = [];
        const twoMarked = [];

        for (let x = 0; x < columns; x++) {
            const cellSymbol = board[y][x].getValue();
            if(cellSymbol === players[0].symbol) oneMarked.push({ x, y });
            else if (cellSymbol === players[1].symbol) twoMarked.push({ x, y });
            else unmarked.push({ x, y });
        }

        return { unmarked, oneMarked, twoMarked };
    };

    const checkColumn = (x) => {
        const unmarked = [];
        const oneMarked = [];
        const twoMarked = [];

        for (let y = 0; y < rows; y++) {
            const cellSymbol = board[y][x].getValue();
            if(cellSymbol === players[0].symbol) oneMarked.push({ x, y });
            else if (cellSymbol === players[1].symbol) twoMarked.push({ x, y });
            else unmarked.push({ x, y });
        }

        return { unmarked, oneMarked, twoMarked };
    };

    const checkDiagonalFwd = () => {
        const unmarked = [];
        const oneMarked = [];
        const twoMarked = [];

        for (let y =  0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                if (x + y === 2){
                    const cellSymbol = board[y][x].getValue();
                    if(cellSymbol === players[0].symbol) oneMarked.push({ x, y });
                    else if (cellSymbol === players[1].symbol) twoMarked.push({ x, y });
                    else unmarked.push({ x, y });
                }
            }
        }

        return { unmarked, oneMarked, twoMarked };
    };

    const checkDiagonalBwd = () => {
        const unmarked = [];
        const oneMarked = [];
        const twoMarked = [];

        for (let y =  0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                if (y === x){
                    const cellSymbol = board[y][x].getValue();
                    if(cellSymbol === players[0].symbol) oneMarked.push({ x, y });
                    else if (cellSymbol === players[1].symbol) twoMarked.push({ x, y });
                    else unmarked.push({ x, y });
                }
            }
        }

        return { unmarked, oneMarked, twoMarked };
    };

    const checkGameState = (xLast, yLast) => {
        // const currentSymbol = getActivePlayer().symbol;
        let result;
        // Look for a "HORIZONTAL" win state on the row of last player input.
        result = checkRow(yLast);
        if(getActivePlayer().symbol === players[0].symbol && result.oneMarked.length === 3) return "WIN";
        if(getActivePlayer().symbol === players[1].symbol && result.twoMarked.length === 3) return "WIN";

        // Look for "VERTICAL" win state.
        result = checkColumn(xLast);
        if(getActivePlayer().symbol === players[0].symbol && result.oneMarked.length === 3) return "WIN";
        if(getActivePlayer().symbol === players[1].symbol && result.twoMarked.length === 3) return "WIN";
        
        // Look for (\) "DIAGONAL" win state.
        if(xLast === yLast){
            result = checkDiagonalBwd();
            if(getActivePlayer().symbol === players[0].symbol && result.oneMarked.length === 3) return "WIN";
            if(getActivePlayer().symbol === players[1].symbol && result.twoMarked.length === 3) return "WIN";
        }
        
        // Look for (/) "DIAGONAL" win state.
        if(xLast + yLast === 2){
            result = checkDiagonalFwd();
            if(getActivePlayer().symbol === players[0].symbol && result.oneMarked.length === 3) return "WIN";
            if(getActivePlayer().symbol === players[1].symbol && result.twoMarked.length === 3) return "WIN";
        }

        // Look for unmarked space. 
        // If none, return "TIE" state. 
        // If found, return "ONGOING" state.
        if (gameBoard.getUnmarkedCounts() === 0) return "TIE";

        return "ONGOING";

    }

    initGame();


    return {
        resetGame,
        startGame,
        playRound,
        getActivePlayer,
        checkGameState,
        checkBoardState
    };

}

const game = GameController();

function markCell(e) {
    const elem = e.target;
    if(game.checkBoardState()){
        return;
    } 
    if(!(elem instanceof Element)) return;
    game.playRound(elem.id);
}

function playGame(e) {
    const elem = e.target;
    if(!(elem instanceof Element)) return;

    game.startGame();
}

function newGame(e) {
    const elem = e.target;
    if(!(elem instanceof Element)) return;

    game.resetGame();
    game.startGame();
}