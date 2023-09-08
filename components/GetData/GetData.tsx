import { FC, useState, useEffect } from "react";
import Web3 from "web3";

interface Props {
  latestRound: string;
  answer: string;
  timestamp: string;
  handleGetDataClick: () => void;
}

export const GetData: FC<Props> = ({
  latestRound,
  answer,
  timestamp,
  handleGetDataClick,
}) => {
  return (
    <div>
      <button
        onClick={handleGetDataClick}
        className="mt-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
      >
        가격 가져오기
      </button>
      {/* <div>
        <p className="pt-5 pb-5 text-white">
          latestRound :
          {latestRound !== null ? latestRound : "데이터가 없습니다."}
        </p>
        <p className="pt-5 pb-5 text-white">
          price : {answer !== null ? answer : "데이터가 없습니다."}
        </p>
        <p className="pt-5 pb-5 text-white">
          timestamp : {timestamp !== null ? timestamp : "데이터가 없습니다."}
        </p>
      </div> */}
    </div>
  );
};
