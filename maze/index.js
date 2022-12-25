// write js code to run different algorithms call methods of algorithms and maze class.
// write js methods to take input from user about size of maze etc. and generate maze by calling maze class methods
let userConfig = null;

$( document ).ready(function () {
    userConfig = new UserConfig();   // initialized the userConfig.
    generateMaze(); // make sure at least one maze is already generated when page loads.
    selectMazeSize('auto');

});

class UserConfig {
    constructor() {
        this.maze1 = null;
        this.maze2 = null;
        this.maze1ID = 'maze1';
        this.maze2ID = 'maze2';
        this.maze1Algo = {
            name: DIJKSTRA_ALGO,
            object: null
        }
        this.maze2Algo = {
            name: ASTAR_M_ALGO,
            object: null
        }

        this.mazeRows = 15; // default
        this.mazeCols = 30; // default since single maze is present.
        this.source = {     // default source
            row: 0,
            col: 0
        }
        this.destinationList = [{ // default destination
            row: this.mazeRows - 1,
            col: this.mazeCols - 1
        }]

        this.isRunning = false;
        this.isMazeGenerated = false; // set true when maze is generated and never set to false.

        // storing the right click (row, col)
        this.clickRow = -1;
        this.clickCol = -1;

        // wall probability

        this.wallProb = .15 ;
        this.delay = 50;
        this.slideDuration = 1000;
    }

    resizeMaze(rows, cols) {
        this.mazeRows = rows;
        this.mazeCols = cols;
        this.source = {     // default source
            row: 0,
            col: 0
        }
        this.destinationList = [{ // default destination
            row: this.mazeRows - 1,
            col: this.mazeCols - 1
        }]
    }

    generateMaze1() {

        let maze1Div = document.getElementById(this.maze1ID);
        if (maze1Div !== null)
            maze1Div.innerHTML = '';

        if (this.maze1 !== null) {
            this.maze1 = null;
        }
        this.maze1 = new Maze(this.maze1ID, this.mazeRows, this.mazeCols, this.wallProb);
        this.maze1.resetStatistics();
        this.maze1.createMaze();
        this.maze1.generateWalls();
        this.maze1.setSourceCell(this.source);
        this.maze1.setDestinationCells(this.destinationList);
        this.isMazeGenerated = true;    // maze generated for the first time.

        this.initAlgoObject(this.maze1);  // initialize algo object for generated maze
        // Remove the maze2 if present.
        if (this.maze2 !== null) {
            this.removeMaze2();
        }
    }

    generateMaze2() {
        // maze1 is by default created so just copy the maze1.
        this.removeMaze2(); // remove and create new maze2 object.
        if (this.maze2 !== null) {
            this.maze2 = null;
        }
        this.maze2 = new Maze(this.maze2ID, this.mazeRows, this.mazeCols, this.wallProb);
        this.maze2.resetStatistics();
        this.maze1.copyMaze(this.maze2);   // copy all the maze1 states to maze2. make sure maze1 is clean.
        this.initAlgoObject(this.maze2);
    }

    removeMaze2() {
        if (this.maze2 !== null) {
            this.maze2.resetStatistics();
            this.maze2 = null;
        }
        let maze2Div = document.getElementById(this.maze2ID);
        if (maze2Div !== null) {
            maze2Div.innerHTML = '';
        }
    }

    getAlgoObject(algoName, mazeObject) {
        let algoObject = null;
        if (algoName === ASTAR_M_ALGO) {
            algoObject = new AStar(mazeObject, ASTAR_M_ALGO);
        } else if (algoName === ASTAR_E_ALGO) {
            algoObject = new AStar(mazeObject, ASTAR_E_ALGO);
        } else if (algoName === ASTAR_D_ALGO) {
            algoObject = new AStar(mazeObject, ASTAR_D_ALGO);
        } else if (algoName === BFS_ALGO) {
            algoObject = new BFS(mazeObject);
        } else if (algoName === DFS_ALGO) {
            algoObject = new DFS(mazeObject);
        } else if (algoName === BIDIRECTIONAL_ALGO) {
            algoObject = new Bidirectional(mazeObject);
        } else if (algoName === DIJKSTRA_ALGO) {
            algoObject = new Dijkstra(mazeObject);
        } else if (algoName === GBFS_M_ALGO) {
            algoObject = new GBFS(mazeObject, GBFS_M_ALGO);
        } else if (algoName === GBFS_E_ALGO) {
            algoObject = new GBFS(mazeObject, GBFS_E_ALGO);
        } else if (algoName === GBFS_D_ALGO) {
            algoObject = new GBFS(mazeObject, GBFS_D_ALGO);
        }
        return algoObject;
    }

    initAlgoObject(mazeObject) {
        if (mazeObject.mazeID === this.maze1ID) {
            this.maze1Algo.object = this.getAlgoObject(this.maze1Algo.name, mazeObject);
        } else {
            this.maze2Algo.object = this.getAlgoObject(this.maze2Algo.name, mazeObject);
        }
    }
}

function sleep (milliSeconds) {
    return new Promise((resolve) => setTimeout(resolve, milliSeconds));
}

function isSourceDestinationSet() {
    if (userConfig.maze1 !== null){
        if(userConfig.maze1.hasSourceDestination() === true) {
            if (userConfig.maze2 !== null){
                if(userConfig.maze2.hasSourceDestination() === true) {
                    return true;
                }
                alert("!!! Select Source/Destination in Maze 2 !!!");
                return false;
            }
            return true;
        }
        alert("!!! Select Source/Destination in Maze !!!");
        return false;
    }
}

function createMaze() {

    let mazeCountButton = document.getElementById("mazeCountButton");
    if (mazeCountButton.value === 'one') {
        setMazeSize('one');
        userConfig.removeMaze2();
        userConfig.generateMaze1();
        mazeCountButton.innerHTML = 'Double Maze';
        mazeCountButton.value = 'two';
    } else {
        setMazeSize('two');
        userConfig.generateMaze1();
        userConfig.generateMaze2();
        mazeCountButton.innerHTML = 'Single Maze';
        mazeCountButton.value = 'one';
    }
    setVisualizeButton();
    userConfig.isRunning = false;
    document.getElementById("selectMazeSize").selectedIndex = 1;
}

function generateMaze() {
    if (userConfig.maze2 !== null) {    // maze2 is present.
        userConfig.generateMaze1();
        userConfig.generateMaze2();
    } else {
        userConfig.generateMaze1();
    }
    setVisualizeButton();
    userConfig.isRunning = false;
}

function resetMaze() {

    if (userConfig.maze2 !== null) {    // maze2 is present.
        userConfig.maze1.resetMaze();
        userConfig.initAlgoObject(userConfig.maze1);
        userConfig.maze2.resetMaze();
        userConfig.initAlgoObject(userConfig.maze2);
        // stop the while loop
        userConfig.maze1.setIsSearching(false);
        userConfig.maze2.setIsSearching(false);
    } else {
        userConfig.maze1.resetMaze();
        userConfig.initAlgoObject(userConfig.maze1);
        userConfig.maze1.setIsSearching(false);
    }
    setVisualizeButton();
    userConfig.isRunning = false;
}

function cleanMaze() {
    if (userConfig.maze2 !== null) {    // maze2 is present.
        userConfig.maze1.cleanMaze();
        userConfig.initAlgoObject(userConfig.maze1);
        userConfig.maze2.cleanMaze();
        userConfig.initAlgoObject(userConfig.maze2);
        userConfig.maze1.setIsSearching(false);
        userConfig.maze2.setIsSearching(false);
    } else {
        userConfig.maze1.cleanMaze();
        userConfig.initAlgoObject(userConfig.maze1);
        userConfig.maze1.setIsSearching(false);
    }
    setVisualizeButton();
    userConfig.isRunning = false;
}

function setVisualizeButton() {
    let visualizeButton = document.getElementById("visualizeButton");
    visualizeButton.innerHTML = "Visualize";
}
function setPauseButton() {
    let visualizeButton = document.getElementById("visualizeButton");
    visualizeButton.innerHTML = "Pause";
}

function toggleVisualizeButton() {
    let visualizeButton = document.getElementById("visualizeButton");
    if (visualizeButton.innerHTML === "Visualize") visualizeButton.innerHTML = "Pause";
    else visualizeButton.innerHTML = "Visualize";
}

function isPathDrawn() {
    if (userConfig.maze1.isPathDrawn() === true) {   // pause button is pressed.
        return true;
    } else if(userConfig.maze2 !== null && userConfig.maze2.isPathDrawn() === true) {
        return true;
    }
    return false;
}



// userConfig = new UserConfig();
async function visualize() {
    if (userConfig.maze1.getIsSearching() === true) {   // pause button is pressed.
        userConfig.maze1.setIsSearching(false);
        if (userConfig.maze2 !== null) {
            userConfig.maze2.setIsSearching(false);
        }
        setVisualizeButton();
        return;
    }

    if (isSourceDestinationSet() === false) return;     // if source and destination is not set return.
    setPauseButton();
    userConfig.isRunning = true;    // user is running.

    // get the name of algorithms from drop down
    // initialize algorithm
    if (userConfig.maze2 === null) {    // only maze1 is present.
        userConfig.maze1.setIsSearching(true);
        // run algorithms
        while (userConfig.maze1.getIsSearching() === true && userConfig.maze1Algo.object.isAlgoOver === false) {
            userConfig.maze1Algo.object.runStep(userConfig.maze1);
            userConfig.maze1.setStatistics();
            userConfig.maze1.drawOnePathCell();
            await sleep(userConfig.delay);
        }
        while(userConfig.maze1.drawOnePathCell() === true) {
            await sleep(userConfig.delay);
        }

        if(alertIfUnreachable() === false && userConfig.maze1Algo.object.isAlgoOver === true)
            $(".pathStatsDiv").slideDown(userConfig.slideDuration);

        userConfig.maze1.setIsSearching(false);
    } else {    // both maze are present.
        userConfig.maze1.setIsSearching(true);
        userConfig.maze2.setIsSearching(true);
        // run algorithms

        while (userConfig.maze1.getIsSearching() === true && userConfig.maze1Algo.object.isAlgoOver === false ||
        userConfig.maze2.getIsSearching() === true && userConfig.maze2Algo.object.isAlgoOver === false) {
            if(userConfig.maze1.getIsSearching() === true){
                userConfig.maze1Algo.object.runStep(userConfig.maze1);
                userConfig.maze1.setStatistics();
            }
            if(userConfig.maze2.getIsSearching() === true) {
                userConfig.maze2Algo.object.runStep(userConfig.maze2);
                userConfig.maze2.setStatistics();
            }
            // draw path if found.
            userConfig.maze1.drawOnePathCell();
            userConfig.maze2.drawOnePathCell();
            await sleep(userConfig.delay);
        }
        while(userConfig.maze1.drawOnePathCell() === true && userConfig.maze2.drawOnePathCell() === true) { // draw in both
            await sleep(userConfig.delay);
        }
        while(userConfig.maze1.drawOnePathCell() === true || userConfig.maze2.drawOnePathCell() === true) { // draw in any one
            await sleep(userConfig.delay);
        }

        if(alertIfUnreachable() === false && userConfig.maze1Algo.object.isAlgoOver === true && userConfig.maze2Algo.object.isAlgoOver === true)
            $(".pathStatsDiv").slideDown(userConfig.slideDuration);

        userConfig.maze1.setIsSearching(false);
        userConfig.maze2.setIsSearching(false);
    }
    setVisualizeButton();
}

async function oneStep() {

    if (isSourceDestinationSet() === false) return;     // if source and destination is not set return.
    setVisualizeButton();
    userConfig.isRunning = true;

    if (userConfig.maze1.getIsSearching() === true) {   // pause button is pressed.
        userConfig.maze1.setIsSearching(false);
        if (userConfig.maze2 !== null) {
            userConfig.maze2.setIsSearching(false);
        }
        await sleep(100);   // wait when first time button is clicked. so that visualize() terminates
    }

    if (userConfig.maze2 === null) {    // only maze1 is present.
        userConfig.maze1.setIsSearching(true);
        // run algorithms
        userConfig.maze1Algo.object.runStep(userConfig.maze1);
        userConfig.maze1.setStatistics();
        await sleep(userConfig.delay);

        while(userConfig.maze1.drawOnePathCell() === true) {
            await sleep(userConfig.delay);
        }

        if(alertIfUnreachable() === false && userConfig.maze1Algo.object.isAlgoOver === true)
            $(".pathStatsDiv").slideDown(userConfig.slideDuration);

        userConfig.maze1.setIsSearching(false);
    } else {    // both maze are present.
        userConfig.maze1.setIsSearching(true);
        userConfig.maze2.setIsSearching(true);
        // run algorithms
        userConfig.maze1Algo.object.runStep(userConfig.maze1);
        userConfig.maze1.setStatistics();

        userConfig.maze2Algo.object.runStep(userConfig.maze2);
        userConfig.maze2.setStatistics();

        await sleep(userConfig.delay);

        while(userConfig.maze1.drawOnePathCell() === true && userConfig.maze2.drawOnePathCell() === true) { // draw in both
            await sleep(userConfig.delay);
        }
        while(userConfig.maze1.drawOnePathCell() === true || userConfig.maze2.drawOnePathCell() === true) { // draw in any one
            await sleep(userConfig.delay);
        }

        if(alertIfUnreachable() === false && userConfig.maze1Algo.object.isAlgoOver === true && userConfig.maze2Algo.object.isAlgoOver === true)
            $(".pathStatsDiv").slideDown(userConfig.slideDuration);

        userConfig.maze1.setIsSearching(false);
        userConfig.maze2.setIsSearching(false);
    }
}

function alertIfUnreachable() {
    let flag = false;
    if(userConfig.maze1 !== null &&
        userConfig.maze1Algo.object.isAlgoOver === true &&
        userConfig.maze1.path.length === 0) {
        alert("Maze 1 Destination Unreachable !!!");
        flag = true;
    }
    if(userConfig.maze2 !== null &&
        userConfig.maze2Algo.object.isAlgoOver === true &&
        userConfig.maze2.path.length === 0) {
        alert("Maze 2 Destination Unreachable !!!");
        flag = true;
    }
    return flag;
}