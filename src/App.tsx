import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import "./App.css";

function helper(positionsLeft: number[][], gameGrid: ICell[][], character: string) {
  let i = Math.floor(Math.random()*positionsLeft.length);
  let gridRow = positionsLeft[i][0];
  let gridCol = positionsLeft[i][1];
  gameGrid[gridRow][gridCol] = { value: character, hidden: true};
  positionsLeft.splice(i, 1);
  console.log(gridRow, gridCol, character)
}

function initGameGrid(rows: number, cols: number): ICell[][] {
  if (((rows*cols) % 2) !== 0)
    return [];
  
  
  const gameGrid: ICell[][] = new Array(rows).fill(0).map((_) => new Array(cols).fill({ value: "", hidden: true}));
  const positionsLeft = [];

  for (let i=0; i < rows; i++)
    for (let j=0; j < cols; j++)
      positionsLeft.push([i,j]);
  
  const characters: string[] = new Array((rows*cols) / 2).fill("").map((_, idx) => String.fromCharCode(65 + idx));
  let charIdx = 0;

  while(positionsLeft.length > 0) {
    let i = Math.floor(Math.random()*positionsLeft.length);
    let gridRow = positionsLeft[i][0];
    let gridCol = positionsLeft[i][1];
    gameGrid[gridRow][gridCol] = { value: characters[charIdx], hidden: true};
    
    positionsLeft.splice(i, 1);

    i = Math.floor(Math.random()*positionsLeft.length);
    gridRow = positionsLeft[i][0];
    gridCol = positionsLeft[i][1];
    gameGrid[gridRow][gridCol] = { value: characters[charIdx], hidden: true};
    
    positionsLeft.splice(i, 1);
    console.log({ value: characters[charIdx], hidden: true})
    charIdx++;
  }

  return gameGrid;  
}

interface ICell {
  hidden: boolean;
  value: string;
}

function App() {
  const shownCells = useRef<number[][]>([]);
  const timeoutRef = useRef<any>(null);

  const [cells, setCells] = useState<ICell[][]>(() => initGameGrid(4,4));
  const [moves, setMoves] = useState<number>(0);  
  const [hasWon, setHasWon] = useState<boolean>(false);


  const hideAll = () => {
    setCells((cells) =>
      cells.map((row) =>
        row.map((cell) => (cell.hidden ? cell : { ...cell, hidden: true }))
      )
    );
    shownCells.current = [];
  };

  const isWin = () => {
    for (const row of cells)
      for (const cell of row)
        if (cell.value !== "")
          return false;
    
    return true;
  }

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if ((!cells[rowIdx][colIdx].hidden) || (timeoutRef.current !== null)) return;
    console.log("timeout", timeoutRef.current)
    
    if (shownCells.current.length === 2) {
      hideAll();
    }

    // hide clicked cell
    const newCells = cells.map((row, i) =>
    row.map((cell, j) => {
      if ((i === rowIdx) && (j === colIdx)) {
        console.log(i, j, rowIdx, colIdx)
        return { ...cell, hidden: false}
      }
      
      return cell
    })
    );
    
    // add new cell to clicked cells
    shownCells.current.push([rowIdx, colIdx]);

    // if 2 cells have been shown
    if (shownCells.current.length === 2) {
      setMoves(moves + 2);
      // if cells match
      if (newCells[shownCells.current[0][0]][shownCells.current[0][1]].value === newCells[shownCells.current[1][0]][shownCells.current[1][1]].value) {
        // show second cell
        setCells(newCells);

        timeoutRef.current = setTimeout(() => {
          // disable them from grid
          shownCells.current.forEach(cellCoordinates => {
            newCells[cellCoordinates[0]][cellCoordinates[1]] = {value: "", hidden: false};
          });
          setCells([...newCells]);
          timeoutRef.current = null;
        }, 300);
        return;
      } else {
        // hide shown cells after 1 second
        timeoutRef.current = setTimeout(() => {
          shownCells.current.forEach(cellCoordinates => {
            newCells[cellCoordinates[0]][cellCoordinates[1]].hidden = true;
          });
          setCells([...newCells]);
          timeoutRef.current = null;
        }, 1000);
      }
    }
    
    setCells(newCells);
  };

  const handleReplay = () => {
    setHasWon(false);
    setCells(initGameGrid(4, 4));
  }

  useEffect(() => {
    if (isWin())
      setHasWon(true);
  }, [cells]);

  return (
    <div className="App">
      { hasWon
        ?
          <>
            <p>You have won in {moves} moves!</p>
            <button onClick={(e) => handleReplay()}>Replay</button>
          </>
        :
          <>
          <div className="memory-grid">
            {cells.map((row, i) =>
              row.map((cell: ICell, j) => (
                <div
                  key={i + "_" + j}
                  onClick={(e) => handleCellClick(i, j)}
                  className="cell"
                  style={{ visibility: cell.value === "" ? "hidden" : "visible" }}
                >
                  {!cell.hidden && cell.value}
                </div>
              ))
            )}
          </div>
          <p>{moves} Moves</p>
          </>
      }
    </div>
  );
}

export default App;
