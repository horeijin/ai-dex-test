import { FC, useState, useEffect } from "react";

import Web3 from "web3";
import BigNumber from "bignumber.js";
import { contractABI, contractAddress } from "@/utils";

import { GetData } from "@/components/GetData/GetData";

interface Props {
  web3: Web3 | null;
  priceList: string[];
  setPriceList: React.Dispatch<React.SetStateAction<string[]>>;
  handlePredBtnClick: () => void;
}

export const Inputbar: FC<Props> = ({
  web3,
  priceList,
  setPriceList,
  handlePredBtnClick,
}) => {
  const [latestRound, setLatestRound] = useState("");
  const [answer, setAnswer] = useState("");
  const [timestamp, setTimestamp] = useState("");

  //함수 1 : 가격 데이터 10개 뿌려주기
  const handleGetDataClick = async () => {
    if (web3) {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      try {
        //latestRound 호출
        const roundIDList: string[] = [];

        const result: any = await contract.methods.latestRound().call();
        const roundID = new BigNumber(result);
        const roundID_str = roundID.toString();
        console.log("latestRound 결과:", roundID_str);

        setLatestRound(roundID_str);

        //가장 최근 기준으로 과거 9개의 roundId 삽입
        for (let i = 9; i >= 1; i--) {
          const roundIDMinus = roundID.minus(i);
          roundIDList.push(roundIDMinus.toString());
        }
        roundIDList.push(roundID_str);

        //getAnswer 호출
        const answer = new BigNumber(
          await contract.methods.getAnswer(roundID_str).call()
        );
        const BIG_TEN = new BigNumber(10);
        const answer_Big = answer.dividedBy(BIG_TEN.pow(8)).toFixed(2); // 10^8로 나누고, 소수점 두 자리까지
        const answer_str = answer_Big.toString();
        console.log("getAnswer 결과:", answer_str);
        setAnswer(answer_str);

        //10개의 roundId에 대한 가격 데이터
        const tempPriceList: string[] = [];
        for (let i = 0; i < roundIDList.length; i++) {
          try {
            const price = new BigNumber(
              await contract.methods.getAnswer(roundIDList[i]).call()
            );
            const price_Big = price.dividedBy(BIG_TEN.pow(8)).toFixed(2);
            const price_str = price_Big.toString();
            tempPriceList.push(price_str);
          } catch (error) {
            console.error(
              `getAnswer 호출 중 오류 발생한 roundID ${roundIDList[i]}:`,
              error
            );
          }
        }
        setPriceList(tempPriceList);

        //getTimestamp 호출
        const timestamp = new BigNumber(
          await contract.methods.getTimestamp(roundID_str).call()
        );

        const date = new Date(timestamp.toNumber() * 1000); //1000곱해서 밀리초로 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const formattedDate = `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;

        console.log("getTimestamp 결과:", formattedDate);
        setTimestamp(formattedDate);

        console.log("가격 정보들을 가져왔습니다.");
      } catch (error) {
        console.error("호출 중 오류 발생:", error);
      }
    }
  };

  return (
    <>
      <GetData
        handleGetDataClick={handleGetDataClick}
        latestRound={latestRound}
        answer={answer}
        timestamp={timestamp}
      />
      <div className="flex flex-col w-40 mt-4 space-y-2">
        <h2 className="pt-5 pb-5 text-white self-center">ETH / USD Price</h2>
        {priceList.length > 0
          ? priceList.map((price, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-black"
              >
                {price}
              </div>
            ))
          : Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-gray-400"
              >
                가격 정보 #{i + 1}
              </div>
            ))}
        <div className="flex justify-center">
          <button
            onClick={handlePredBtnClick}
            className="mt-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
          >
            예측하기
          </button>
        </div>
      </div>
    </>
  );
};
