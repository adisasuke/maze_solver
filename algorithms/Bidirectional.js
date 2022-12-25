class Bidirectional {

    constructor(mazeObject) {
        this.fromSource = {
            openSet: new Set(),
            closedSet: new Set(),
            hFunction: new BiManhattan()
        }
        this.fromDestination = {
            openSet: new Set(),
            closedSet: new Set(),
            hFunction: new BiManhattan()
        }
        // These two are adjacent to each other.
        this.cellFromSource = null;
        this.cellFromDestination = null;

        this.isAlgoOver = false;

        for (let row = 0; row < mazeObject.rows; row += 1) {
            for (let col = 0; col < mazeObject.cols; col += 1) {
                mazeObject.maze[row][col].heuristics = {
                    state: NEW,
                    from: null,     // first discovered from source or destination.
                    f: Number.MAX_SAFE_INTEGER,
                    g: Number.MAX_SAFE_INTEGER,
                    h: Number.MAX_SAFE_INTEGER, // get the h value. h value is fixed.
                    parent: null    // cell is reached from parent with min cost.
                };
            }
        }

        let source = mazeObject.getSourceCell();
        source.heuristics.from = SOURCE;
        let destination = mazeObject.getOneDestinationCell();
        destination.heuristics.from = DESTINATION;

        source.heuristics.g = 0;
        destination.heuristics.g = 0;

        source.heuristics.h = this.fromSource.hFunction.hScore(source, mazeObject);
        destination.heuristics.h = this.fromDestination.hFunction.hScore(destination, mazeObject);

        source.heuristics.f = source.heuristics.h + source.heuristics.g;
        destination.heuristics.f = destination.heuristics.h + destination.heuristics.g;

        this.fromSource.openSet.add(source);
        this.fromDestination.openSet.add(destination);
    }

    runStep(mazeObject) {
        if (this.isAlgoOver === true) {
            mazeObject.setIsSearching(false);
            return;
        }
        if (mazeObject.getDestinationCells().size > 1) {
            this.isAlgoOver = true;
            alert("!!! Bidirectional supports only one destination !!!");
            return;
        }

        let sourceFlag = false;
        let destinationFlag = false;
        // run from source.
        if (this.fromSource.openSet.size > 0) {
            sourceFlag = true;
            let current = this.minCostCell(this.fromSource);
            this.fromSource.openSet.delete(current);
            current.heuristics.state = CLOSED;  // closed is internal state same as visited
            this.fromSource.closedSet.add(current);

            if (current.state !== SOURCE)
                mazeObject.setCellState(current, VISITED); // cell is visited change colour

            let neighbors = this.getAllNeighbours(current, mazeObject);
            let self = this;
            neighbors.some(function (element, index) { // some() stops if true is returned. forEach never stops
                if (element.heuristics.from === DESTINATION) {   // path found
                    self.cellFromSource = current;
                    self.cellFromDestination = element;
                    mazeObject.setIsSearching(false);
                    mazeObject.addNewPath(element);
                    self.isAlgoOver = true;
                    return true;
                }
                if (element.heuristics.state === NEW) {
                    element.heuristics.from = SOURCE;   // from will never change again.
                    element.heuristics.state = OPEN;
                    element.heuristics.h = self.fromSource.hFunction.hScore(element, mazeObject);
                    element.heuristics.g = current.heuristics.g + 1;
                    element.heuristics.f = element.heuristics.g + element.heuristics.h;
                    element.heuristics.parent = current;
                    self.fromSource.openSet.add(element);
                    mazeObject.setCellState(element, OPEN);
                } else if (element.heuristics.state === CLOSED) {
                    if (element.heuristics.g > current.heuristics.g + 1) {
                        element.heuristics.g = current.heuristics.g + 1;
                        element.heuristics.f = element.heuristics.g + element.heuristics.h;
                        self.fromSource.closedSet.delete(element);
                        element.heuristics.state = OPEN;
                        self.fromSource.openSet.add(element);
                        element.heuristics.parent = current;
                        mazeObject.setCellState(element, EMPTY);
                    }
                } else if (element.heuristics.state === OPEN) {
                    if (element.heuristics.g > current.heuristics.g + 1) {
                        element.heuristics.g = current.heuristics.g + 1;
                        element.heuristics.f = element.heuristics.g + element.heuristics.h;
                        element.heuristics.parent = current;
                    }
                }
            });
            if (this.isAlgoOver === true)  // path found. no need to run for destination.
                return;
        }
        // run from destination.
        if (this.fromDestination.openSet.size > 0) {
            destinationFlag = true;
            let current = this.minCostCell(this.fromDestination);
            this.fromDestination.openSet.delete(current);
            current.heuristics.state = CLOSED;  // closed is internal state same as visited
            this.fromDestination.closedSet.add(current);

            if (current.state !== DESTINATION)
                mazeObject.setCellState(current, VISITED); // cell is visited change colour

            let neighbors = this.getAllNeighbours(current, mazeObject);
            let self = this;
            neighbors.some(function (element, index) { // some() stops if true is returned. forEach never stops
                if (element.heuristics.from === SOURCE) {   // path found
                    self.cellFromSource = element;
                    self.cellFromDestination = current;
                    mazeObject.setIsSearching(false);
                    self.isAlgoOver = true;
                    return true;
                }
                if (element.heuristics.state === NEW) {
                    element.heuristics.from = DESTINATION;   // from will never change again.
                    element.heuristics.state = OPEN;
                    element.heuristics.h = self.fromDestination.hFunction.hScore(element, mazeObject);
                    element.heuristics.g = current.heuristics.g + 1;
                    element.heuristics.f = element.heuristics.g + element.heuristics.h;
                    element.heuristics.parent = current;
                    self.fromDestination.openSet.add(element);
                    mazeObject.setCellState(element, OPEN);
                } else if (element.heuristics.state === CLOSED) {
                    if (element.heuristics.g > current.heuristics.g + 1) {
                        element.heuristics.g = current.heuristics.g + 1;
                        element.heuristics.f = element.heuristics.g + element.heuristics.h;
                        self.fromDestination.closedSet.delete(element);
                        element.heuristics.state = OPEN;
                        self.fromDestination.openSet.add(element);
                        element.heuristics.parent = current;
                        mazeObject.setCellState(element, EMPTY);
                    }
                } else if (element.heuristics.state === OPEN) {
                    if (element.heuristics.g > current.heuristics.g + 1) {
                        element.heuristics.g = current.heuristics.g + 1;
                        element.heuristics.f = element.heuristics.g + element.heuristics.h;
                        element.heuristics.parent = current;
                    }
                }
            });
        }
        if (sourceFlag === false || destinationFlag === false) {
            this.isAlgoOver = true;
        }
    }

    getAllNeighbours(cell, mazeObject) { // return neighbours with mentioned state.
        let neighbours = [];
        let curRow = cell.row;
        let curCol = cell.col;
        for (let row = -1; row <= 1; row += 1) {
            for (let col = -1; col <= 1; col += 1) {
                if (row !== 0 && col === 0 || row === 0 && col !== 0) { // top, bottom, left, right
                    let nRow = curRow + row; // neighbour row
                    let nCol = curCol + col; // neighbour col
                    if (nRow < 0 || nRow >= mazeObject.rows || nCol < 0 || nCol >= mazeObject.cols) continue; // validate cell index
                    if (mazeObject.maze[nRow][nCol].state === EMPTY ||
                        mazeObject.maze[nRow][nCol].state === SOURCE ||
                        mazeObject.maze[nRow][nCol].state === DESTINATION ||
                        mazeObject.maze[nRow][nCol].state === VISITED) {
                        neighbours.push(mazeObject.maze[nRow][nCol]);
                    }
                }
            }
        }
        return neighbours;
    }

    minCostCell(from) {
        let minCost = Number.MAX_SAFE_INTEGER;
        let minCell = null;
        let array = Array.from(from.openSet);
        array.forEach((element) => {
            if (element.heuristics.f < minCost) {
                minCell = element;
                minCost = element.heuristics.f;
            }
        });
        return minCell;
    }
}

// Heuristic distance
class BiManhattan {
    hScore(cell, mazeObject) {
        let from = cell.heuristics.from;
        let minH = Number.MAX_SAFE_INTEGER;
        let target = null;
        if (from === SOURCE) target = mazeObject.getOneDestinationCell();
        else target = mazeObject.getSourceCell();

        let h = Math.abs(target.row - cell.row) + Math.abs(target.col - cell.col);
        if (h < minH) {
            minH = h;
        }
        return minH;
    }
}
