import React, { useEffect, useState } from "react";
import "./App.css";
import Squares from "./Square/Squares";
import Winner from "./Winner/Winner";
import Swal from "sweetalert2";

import { io } from "socket.io-client";
const socket = io("http://localhost:3000", {
  autoConnect: true,
});

const App = () => {
  const renderFrom = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedStateArray, setFinishedStateArray] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    for (let rowIndex = 0; rowIndex < gameState.length; rowIndex++) {
      if (
        gameState[rowIndex][0] === gameState[rowIndex][1] &&
        gameState[rowIndex][2] === gameState[rowIndex][1]
      ) {
        setFinishedStateArray([
          rowIndex * 3 + 0,
          rowIndex * 3 + 1,
          rowIndex * 3 + 2,
        ]);
        console.log(gameState[rowIndex][0]);
        return gameState[rowIndex][0];
      }
    }
    for (let colIndex = 0; colIndex < gameState.length; colIndex++) {
      if (
        gameState[0][colIndex] === gameState[1][colIndex] &&
        gameState[1][colIndex] === gameState[2][colIndex]
      ) {
        setFinishedStateArray([
          colIndex + 0,
          colIndex + 3 * 1,
          colIndex + 3 * 2,
        ]);
        console.log(gameState[0][colIndex]);
        return gameState[0][colIndex];
      }
    }

    if (
      gameState[0][0] === gameState[2][2] &&
      gameState[0][0] === gameState[1][1]
    ) {
      setFinishedStateArray([0, 4, 8]);
      return gameState[0][0];
    }

    if (
      gameState[2][0] === gameState[0][2] &&
      gameState[2][0] === gameState[1][1]
    ) {
      setFinishedStateArray([2, 4, 6]);
      return gameState[2][0];
    }

    return null;
  };

  const isDraw = gameState.flat().every((e) => {
    if (e === "circle" || e === "cross") {
      return true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    let winner = checkWinner();
    if (winner === "circle" || winner === "cross") {
      console.log("WINNER IS ", winner);
      setFinishedState(winner);
    }
    if (isDraw) setFinishedState("draw");
  }, [gameState]);

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  async function playOnlineClick() {
    const result = await takePlayerName();
    // console.log(result); properties like isConfirmed and value
    if (!result.isConfirmed) return;
    if (!result.value) return;
    const userName = result.value;
    setPlayerName(userName);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: userName,
    });

    setSocket(newSocket);
  }

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for Opponent...</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic-Tac-Toe</h1>
        <div className="squares-wrapper">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Squares
                  id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedStateArray={finishedStateArray}
                  setGameState={setGameState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  currentElement={e}
                />
              );
            })
          )}
        </div>
        <Winner finishedState={finishedState} />
        <div>
          {!finishedState && opponentName && (
            <h3>You are playing against {opponentName}</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
