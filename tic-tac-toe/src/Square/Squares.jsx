import React, { useState } from "react";
import "../App.css";
import "./Squares.css";

const Squares = ({
  id,
  socket,
  playingAs,
  gameState,
  finishedStateArray,
  setGameState,
  finishedState,
  currentPlayer,
  setCurrentPlayer,
  currentElement,
}) => {
  const [value, setValue] = useState(null);

  const myPlayer = currentPlayer;
  const handleClick = () => {
    if (finishedState) {
      return;
    }
    if (value) {
      return;
    }
    if (!value) {
      if (currentPlayer === "circle") setValue("O");
      else setValue("X");
    }

    const myCurrentPlayer = currentPlayer;
    socket.emit("playerMoveFromClient", {
      state: {
        id,
        sign: myCurrentPlayer,
      },
    });

    setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

    setGameState((prevState) => {
      // Create a deep copy using map and spread operator for each row
      let newState = prevState.map((row) => [...row]);
      let rowInd = Math.floor(id / 3);
      let colInd = id % 3;
      newState[rowInd][colInd] = myPlayer;
      console.log(newState);
      return newState;
    });
  };

  return (
    <div
      className={`square water-background ${
        finishedState ? "not-allowed" : ""
      } ${finishedStateArray.includes(id) ? finishedState + "-won" : ""}`}
      onClick={handleClick}
    >
      {currentElement === "circle" ? "O" : id === "cross" ? "X" : value}
    </div>
  );
};

export default Squares;
