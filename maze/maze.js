class Maze {
    constructor(mazeID, rows, cols, wallProb) {
        this.mazeID = mazeID;
        this.rows = rows;
        this.cols = cols;

        this.maze = [[]];
        this.isSearching = false;

        this.wallProb = wallProb ;
        // all the paths will be stored in this.
        this.path = [];
        this.pathToDraw = [];
        this.statistics = []; // list of objects.
    }

    getMazeID() {
        return this.mazeID;
    }

    getIsSearching() {
        return this.isSearching;
    }

    setIsSearching(bool) {
        this.isSearching = bool;
    }

    getSourceCell() {
        // return source cell.
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === SOURCE) {
                    return this.maze[row][col];
                }
            }
        }
        return null;
    }

    hasSourceCell() {
        return this.getSourceCell() !== null;
    }

    setSourceCell(source) {
        this.setCellState(this.maze[source.row][source.col], SOURCE);
    }

    isSourceCell(cell) {
        return cell.state === SOURCE;
    }

    isDestinationCell(cell) {
        return cell.state === DESTINATION;
    }

    getDestinationCells() {
        // return list of destination cells
        let destinations = new Set();
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === DESTINATION) {
                    destinations.add(this.maze[row][col]);
                }
            }
        }
        return destinations;
    }

    getOneDestinationCell() {
        // return one of destination cells
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === DESTINATION) {
                    return this.maze[row][col];
                }
            }
        }
        return null;
    }

    setDestinationCells(destinationList) {
        // set list of destination cells
        let array = Array.from(destinationList);
        let self = this;
        array.forEach((destination) => {
            self.maze[destination.row][destination.col].state = DESTINATION;
            self.setCellState(this.maze[destination.row][destination.col], DESTINATION);
        });
    }

    hasDestinationCell() {
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === DESTINATION) {
                    return true;
                }
            }
        }
        return false;
    }

    isAllDestinationsReached() {
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === DESTINATION &&
                    this.maze[row][col].heuristics.state === NEW) {
                    return false;
                }
            }
        }
        return true;
    }


    hasSourceDestination() {
        return this.hasSourceCell() && this.hasDestinationCell();
    }

    setCellState(cell, state) {
        // setTimeout(() => {  console.log("World!"); }, 2000);

        let element = document.getElementById(this.getMazeID()+'-'+cell.row+'-'+cell.col);
        if (state === EMPTY) {
            cell.state = EMPTY;
            element.className = EMPTY_CLASS;
        } else if (state === WALL) {
            cell.state = WALL;
            element.className = WALL_CLASS;
        } else if (state === SOURCE) {
            cell.state = SOURCE;
            element.className = SOURCE_CLASS;
        } else if (state === DESTINATION) {
            cell.state = DESTINATION;
            element.className = DESTINATION_CLASS;
        } else if (state === VISITED) {
            cell.state = VISITED;
            element.className = VISITED_CLASS;
        } else if (state === PATH) {
            cell.state = PATH;
            element.className = PATH_CLASS;
        } else if (state === BORDER) {
            cell.state = BORDER;
            element.className = BORDER_CLASS;
        } else if (state === OPEN) {
            cell.heuristics.state = OPEN;
            element.className = OPEN_CLASS;
        }
    }

    setCellColor(cell, state) {
        let element = document.getElementById(this.getMazeID()+'-'+cell.row+'-'+cell.col);
        if (state === PATH) {
            element.className = PATH_CLASS;
        } else if (state === VISITED) {
            element.className = VISITED_CLASS;
        }
    }

    flipCellState(cell) {   // flip empty to wall, and wall to empty.
        if (cell.state === EMPTY)
            this.setCellState(cell, WALL)
        else
            this.setCellState(cell, EMPTY)

    }

    generateWalls() {
        // generate walls randomly at any cell used when user click to generate maze.
        let walls = 0;
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if(Math.random() < this.wallProb) {
                    walls += 1;
                    this.setCellState(this.maze[row][col], WALL);
                } else {
                    this.setCellState(this.maze[row][col], EMPTY);
                }
            }
        }
    }

    cleanMaze() {
        // clear entire maze set each cell to EMPTY except source destinations.
        this.resetStatistics();
        this.initPath();
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                this.maze[row][col] = {
                    state: EMPTY,
                    row: row,
                    col: col,
                    heuristics: null     // this object stores the statistics of cell used only in algorithms
                };
                this.setCellState(this.maze[row][col], EMPTY);
            }
        }
        // set the source and destination from user config it might be changed because of any bug or user input selection.
        this.setSourceCell(userConfig.source);
        this.setDestinationCells(userConfig.destinationList);
    }

    resetMaze() {
        // clear entire maze set each cell to EMPTY except source destination and wall.
        this.resetStatistics();
        this.initPath();
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state !== WALL) {
                    this.maze[row][col] = {
                        state: EMPTY,
                        row: row,
                        col: col,
                        heuristics: null     // this object stores the statistics of cell used only in algorithms
                    };
                    this.setCellState(this.maze[row][col], EMPTY);
                }
            }
        }
        // set the source and destination from user config it might be changed because of any bug or user input selection.
        this.setSourceCell(userConfig.source);
        this.setDestinationCells(userConfig.destinationList);
    }


    createTable() {
        let mazeDiv = document.getElementById(this.getMazeID());
        mazeDiv.classList.add('maze');
        let table = document.createElement('table');
        table.classList.add('table');
        table.classList.add('table-bordered');
        table.classList.add('maze-table');
        let tableBody = document.createElement('tbody');
        for (let row = 0; row < this.rows; row += 1) {
            let tr = document.createElement('tr');
            for (let col = 0; col < this.cols; col += 1) {
                let td = document.createElement('td');

                td.id = `${this.getMazeID()}-${row}-${col}`;

                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
        table.appendChild(tableBody);
        mazeDiv.appendChild(table);

        // for (let i = 0; i < 35; i+=1) {
        //     let br = document.createElement('br');
        //     mazeDiv.appendChild(br);
        // }

        if (this.getMazeID() === userConfig.maze1ID) {
            document.getElementsByTagName('table')[0].addEventListener('click', mazeClick, false);
        } else if (this.getMazeID() === userConfig.maze2ID) {
            document.getElementsByTagName('table')[1].addEventListener('click', mazeClick, false);
        }

    }


    createMaze() {  // creates the empty maze.
        for (let row = 0; row < this.rows; row += 1) {
            this.maze[row] = [];
            for (let col = 0; col < this.cols; col += 1) {
                this.maze[row][col] = {
                    state: EMPTY,
                    row: row,
                    col: col,
                    heuristics: null     // this object stores the statistics of cell used only in algorithms
                };
            }
        }
        this.createTable();
    }

    copyMaze(newMaze) {
        newMaze.createMaze();

        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                newMaze.setCellState(newMaze.maze[row][col], this.maze[row][col].state);
            }
        }
    }

    getBidirectionalPath(fromSource, fromDestination) {
        let pathCell = fromSource;
        let spath = []; // don't include source and destination in path.
        while (pathCell !== null && pathCell.state !== SOURCE) {
            spath.push(pathCell);
            pathCell = pathCell.heuristics.parent;
        }
        spath.reverse();

        pathCell = fromDestination;
        let dpath = []; // don't include source and destination in path.
        while (pathCell !== null && pathCell.state !== DESTINATION) {
            dpath.push(pathCell);
            pathCell = pathCell.heuristics.parent;
        }
        dpath.reverse();

        let path = [];
        while (spath.length > 0 && dpath.length > 0) {
            path.push(spath.pop());
            path.push(dpath.pop());
        }
        while (spath.length > 0) {
            path.push(spath.pop());
        }
        while (dpath.length > 0) {
            path.push(dpath.pop());
        }
        return path;
    }

    getPath(fromDestination=null) {
        if (this.mazeID === userConfig.maze1ID && userConfig.maze1Algo.name === BIDIRECTIONAL_ALGO) {
            let source = userConfig.maze1Algo.object.cellFromSource;
            let destination = userConfig.maze1Algo.object.cellFromDestination;
            return this.getBidirectionalPath(source, destination);
        } else if (this.mazeID === userConfig.maze2ID && userConfig.maze2Algo.name === BIDIRECTIONAL_ALGO) {
            let source = userConfig.maze2Algo.object.cellFromSource;
            let destination = userConfig.maze2Algo.object.cellFromDestination;
            return this.getBidirectionalPath(source, destination);
        }

        let pathCell = fromDestination.heuristics.parent;
        let path = []; // don't include source and destination in path.
        while (pathCell !== null && pathCell.state !== SOURCE) {
            path.push(pathCell);
            pathCell = pathCell.heuristics.parent;
        }
        path.reverse();
        return path;
    }

    isPathDrawn() {
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === PATH) {
                    return true;
                }
            }
        }
        return false;
    }

    setStatistics(){
        let stats = this.getCurrentStatistics();

        let notVisitedCells = document.getElementById("New Cells"+" "+this.mazeID);
        notVisitedCells.value = stats.heuristics.NEW;

        let visitedCells = document.getElementById("Visited Cells"+" "+this.mazeID);
        visitedCells.value = stats.heuristics.OPEN;

        let exploredCells = document.getElementById("Explored Cells"+" "+this.mazeID);
        exploredCells.value = stats.heuristics.CLOSED;

    }


    resetStatistics(){
        this.resetPathStatistics();

        let notVisitedCells = document.getElementById("New Cells"+" "+this.mazeID);
        notVisitedCells.value = 0 ;

        let visitedCells = document.getElementById("Visited Cells"+" "+this.mazeID);
        visitedCells.value = 0 ;

        let exploredCells = document.getElementById("Explored Cells"+" "+this.mazeID);
        exploredCells.value = 0 ;
    }

    initPath() {
        this.path = [];
        this.pathToDraw = [];
    }

    getCurrentStatistics() {
        let stats = {
            heuristics: {
                NEW: 0,
                OPEN: 0,
                CLOSED:0
            },
            EMPTY: 0,
            VISITED: 0,
            WALL: 0,
            PATH_LENGTH:0
        }
        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                if (this.maze[row][col].state === WALL) {
                    stats.WALL += 1;
                    continue;
                }
                if (this.maze[row][col].heuristics.state === NEW) {
                    stats.heuristics.NEW += 1;
                } else if (this.maze[row][col].heuristics.state === OPEN) {
                    stats.heuristics.OPEN += 1;
                } else if (this.maze[row][col].heuristics.state === CLOSED) {
                    stats.heuristics.CLOSED += 1;
                }
                if (this.maze[row][col].state === EMPTY) {
                    stats.EMPTY += 1;
                } else if (this.maze[row][col].state === VISITED) {
                    stats.VISITED += 1;
                }
            }
        }
        return stats;
    }

    addNewPath(destination) {
        let path = this.getPath(destination);
        this.path.push(path);
        this.pathToDraw.push(path);
        let stats = this.getCurrentStatistics();
        stats.PATH_LENGTH = path.length;
        stats.destination = destination;
        this.statistics.push(stats);
        this.setPathStatistics();
    }

    getPathStatistics(pathNumber, stats) {
        let html = "";
        html += "<tr><td id='"+pathNumber+"'><b>Destination"+pathNumber+"</b> at ["+(stats.destination.row+1)+", "+(stats.destination.col+1)+"]</td><td> Path Length: <b>"+
            stats.PATH_LENGTH+"</b></td><td class='pathStatsNew'> New: <b>"+stats.heuristics.NEW+"</b></td><td class='pathStatsVisited'> Visited: <b>"+stats.heuristics.OPEN+"</b></td><td class='pathStatsExplored'> Explored: <b>"+stats.heuristics.CLOSED+"</b></td></tr>";
        return html;
    }

    setPathStatistics() {
        let div = document.getElementById(this.mazeID+"stats");
        let html = "<table class='table table-bordered table-path'>";
        let count = 0;
        for (let i = 0; i < this.statistics.length; i += 1) {
            html += this.getPathStatistics(i+1, this.statistics[i]);
            count += 1;
        }

        html += "</table>";
        div.innerHTML = html;

        let cell1Rect = document.getElementById(userConfig.maze1ID+"-1-1").getBoundingClientRect();
        let cell2Rect = document.getElementById(userConfig.maze1ID+"-2-2").getBoundingClientRect();
        let cellHeight = cell2Rect.y - cell1Rect.y;
        let cellWidth = cell2Rect.x - cell1Rect.x;
        let divHeight = Math.ceil((cellHeight+2) * count); // path stats cell border is 3px but maze cell border is 1px. so 3-1 = 2 extra per cell.
        userConfig.slideDuration = 1000 + count * 200;
        if(userConfig.slideDuration > 2000) userConfig.slideDuration = 2000;

        div.style.height = divHeight+"px";

    }

    resetPathStatistics() {
        let div = document.getElementById(this.mazeID+"stats");
        this.statistics = [];
        $(".pathStatsDiv").slideUp(userConfig.slideDuration, function (){
            div.innerHTML = '';
            div.style.height = "0px";
        });
    }

    drawOnePathCell() { // make one cell of each path green.
        let drawn = false;
        if (this.pathToDraw.length > 0) {
            for(let pathNumber = 0; pathNumber < this.pathToDraw.length; pathNumber += 1) {
                if (this.pathToDraw[pathNumber].length > 0) {
                    let pathCell = this.pathToDraw[pathNumber].shift();
                    if (pathCell.state !== DESTINATION)     // don't change color of destination.
                        this.setCellState(pathCell, PATH);
                    drawn = true;
                }
            }
        }
        return drawn;
    }

    GBFSKillerPath() {
        let dest = this.getOneDestinationCell(); // there is only one destination. for killer maze.
        let row = dest.row;
        let col = dest.col;
        // wall from RHS.
        for(let i = row-1; i <= row+1; i += 1) {
            this.setCellState(this.maze[i][col+1], WALL);
        }
        this.setCellState(this.maze[row-1][col], WALL);
        this.setCellState(this.maze[row+1][col], WALL);

        for(let j = col-1; j >= 0; j -= 1) {
            this.setCellState(this.maze[row-1][j], WALL);
            this.setCellState(this.maze[row][j], EMPTY);
            this.setCellState(this.maze[row+1][j], WALL);
        }
        for(let i = row-1; i > 2; i -= 1) {
            this.setCellState(this.maze[i][0], EMPTY);
            this.setCellState(this.maze[i][1], WALL);
        }
        for(let i = 0; i <= 2; i += 1) {
            for(let j = 0; j <=2; j += 1) {
                if(this.maze[i][j].state === SOURCE) continue;
                this.setCellState(this.maze[i][j], EMPTY);
            }
        }
    }
}

