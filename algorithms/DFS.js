class DFS {

    constructor(mazeObject) {
        this.stack = [];
        this.closedSet = new Set();
        this.isAlgoOver = false;
        this.last = null

        for (let row = 0; row < mazeObject.rows; row += 1) {
            for (let col = 0; col < mazeObject.cols; col += 1) {
                mazeObject.maze[row][col].heuristics = {
                    state: NEW,
                    cost: Number.MAX_SAFE_INTEGER,
                    parent: null    // cell is reached from parent with min cost.
                };
            }
        }

        let source = mazeObject.getSourceCell();
        source.heuristics.cost = 0;
        this.stack.push(source);
        this.last = source;
    }

    runStep(mazeObject) {
        if (this.isAlgoOver === true) {
            mazeObject.setIsSearching(false);
            return;
        }

        if (this.stack.length > 0) {
            let current = this.stack.pop();
            current.heuristics.state = CLOSED;  // closed is internal state same as visited
            this.closedSet.add(current);

            if (current.state !== SOURCE && current.state !== DESTINATION) {
                mazeObject.setCellState(current, VISITED); // cell is visited change colour
                mazeObject.setCellColor(current, PATH);
            }
			if (this.last.state !== SOURCE && this.last.state !== DESTINATION) {
                mazeObject.setCellColor(this.last, VISITED);
            }
            this.last = current;

            let neighbors = this.getUnvisitedNeighbours(current, mazeObject);
            let self = this;
            neighbors.some(function (element, index) { // some() stops if true is returned. forEach never stops
                if (element.heuristics.state === NEW) {
                    element.heuristics.state = OPEN;
                    element.heuristics.cost = current.heuristics.cost + 1;
                    element.heuristics.parent = current;
                    self.stack.push(element);
                    if (mazeObject.isDestinationCell(element) === false) {  // don't change color of destination.
                        mazeObject.setCellState(element, OPEN);
                    } else {    // process destination.
                        mazeObject.addNewPath(element);
                        if (mazeObject.isAllDestinationsReached() === true) {
                            self.isAlgoOver = true;
                            mazeObject.setIsSearching(false);
                            return true;
                        }
                    }
                }
            });
        } else {
            this.isAlgoOver = true;
        }
    }

    getUnvisitedNeighbours(cell, mazeObject) { // return neighbours with mentioned state.
        let neighbours = [];
        let curRow = cell.row;
        let curCol = cell.col;
        for (let row = -1; row <= 1; row += 1) {
            for (let col = -1; col <= 1; col += 1) {
                if (row !== 0 && col === 0 || row === 0 && col !== 0) { // top, bottom, left, right
                    let nRow = curRow + row; // neighbour row
                    let nCol = curCol + col; // neighbour col
                    if (nRow < 0 || nRow >= mazeObject.rows || nCol < 0 || nCol >= mazeObject.cols) continue; // validate cell index
                    if (mazeObject.maze[nRow][nCol].state === EMPTY || mazeObject.maze[nRow][nCol].state === DESTINATION) {
                        neighbours.push(mazeObject.maze[nRow][nCol]);
                    }
                }
            }
        }
        return neighbours;
    }
}