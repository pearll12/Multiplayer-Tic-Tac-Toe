import React from "react";

const Winner = ({ finishedState }) => {
  return (
    <>
      {finishedState === "draw" ? (
        <h3>It's a draw.</h3>
      ) : (
        finishedState && <h3>{finishedState} won the match.</h3>
      )}
    </>
  );
};

export default Winner;
