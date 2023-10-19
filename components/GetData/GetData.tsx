import { FC, useState, useEffect } from "react";
import Web3 from "web3";

interface Props {
  latestRound: string;
  answer: string;
  timestamp: string;
  handleGetDataClick: () => void;
  handleGetDataClick2: () => void;
}

export const GetData: FC<Props> = ({
  latestRound,
  answer,
  timestamp,
  handleGetDataClick,
  handleGetDataClick2,
}) => {
  return (
    <div>
      <button
        onClick={handleGetDataClick}
        className="mt-4 mr-2 bg-blue-400 p-2 rounded hover:bg-blue-600"
      >
        가격 조회
        <br />
        (roundId)
      </button>
      <button
        onClick={handleGetDataClick2}
        className="mt-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
      >
        가격 조회
        <br />
        (1분간격)
      </button>
      <div>
        <p className="pt-10 text-white">
          latestRound :<br />
          {latestRound !== null ? latestRound : ""}
        </p>
        <p className="pt-2 text-white">
          price : <br />
          {answer !== null ? answer : ""}
        </p>
        <p className="pt-2 text-white">
          timestamp : <br />
          {timestamp !== null ? timestamp : ""}
        </p>
      </div>
    </div>
  );
};
