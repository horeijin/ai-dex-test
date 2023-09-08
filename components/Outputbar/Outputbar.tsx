import { FC, useState, useEffect } from "react";
import Web3 from "web3";

interface Props {
  web3: Web3 | null;
  predList: string[];
  handleSendBtnClick: () => void;
}

export const Outputbar: FC<Props> = ({
  web3,
  predList,
  handleSendBtnClick,
}) => {
  return (
    <div className="flex flex-col w-40 mt-4 space-y-2">
      <h2 className="pt-5 pb-5 text-white self-center">모델의 예측값</h2>
      {predList.length > 0
        ? predList.map((pred, i) => (
            <div
              key={i}
              className="w-full p-2 rounded bg-white border border-gray-300 text-center text-black"
            >
              {pred}
            </div>
          ))
        : Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full p-2 rounded bg-white border border-gray-300 text-center text-gray-400"
            >
              예측값 #${i + 1}
            </div>
          ))}
      <div className="flex justify-center">
        <button
          onClick={handleSendBtnClick}
          className="mt-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
        >
          컨트랙트로 전송
        </button>
      </div>
    </div>
  );
};
