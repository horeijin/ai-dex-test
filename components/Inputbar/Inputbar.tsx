import { FC, useState, useEffect } from "react";

import Web3 from "web3";
import BigNumber from "bignumber.js";
import { contractABI, contractAddress } from "@/utils";

import { GetData } from "@/components/GetData/GetData";

interface Props {
  web3: Web3 | null;
  priceList: string[];
  predList: string[];
  displayMode: "CREATION" | "CURRENT" | undefined;
  setPriceList: React.Dispatch<React.SetStateAction<string[]>>;
  setPredList: React.Dispatch<React.SetStateAction<string[]>>;
  setDisplayMode: React.Dispatch<
    React.SetStateAction<"CREATION" | "CURRENT" | undefined>
  >;
  handlePredBtnClick: () => void;
}

export const Inputbar: FC<Props> = ({
  web3,
  priceList,
  predList,
  displayMode,
  setPriceList,
  setPredList,
  setDisplayMode,
  handlePredBtnClick,
}) => {
  const [latestRound, setLatestRound] = useState("");
  const [answer, setAnswer] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [roundIDList, setRoundIDList] = useState<string[]>([]);
  const [timestampList, setTimestampList] = useState<string[]>([]);

  //함수 1 : 가격 데이터 10개 뿌려주기 (roundId순)
  const handleGetDataClick = async () => {
    setDisplayMode("CREATION");
    setPredList([]);
    if (web3) {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const roundIDList = [];
      const priceList = [];
      const timestampList = [];

      try {
        //latestRound 호출
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
        setRoundIDList(roundIDList);

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

        //getTimestamp호출
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

        //10개의 roundId에 대한 시간 데이터
        const tempTimestampList: string[] = [];
        for (let i = 0; i < roundIDList.length; i++) {
          try {
            const timestamp = new BigNumber(
              await contract.methods.getTimestamp(roundIDList[i]).call()
            );
            const date = new Date(timestamp.toNumber() * 1000); //1000곱해서 밀리초로 변환
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");

            const formattedDate = `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
            tempTimestampList.push(formattedDate);
          } catch (error) {
            console.error(error);
          }
        }
        setTimestampList(tempTimestampList);

        console.log("가격 정보들을 가져왔습니다.");
      } catch (error) {
        console.error("호출 중 오류 발생:", error);
      }
    }
  };

  //함수2 : 가격 데이터 10개 뿌려주기 (1분단위)
  const handleGetDataClick2 = async () => {
    setDisplayMode("CURRENT");
    setPredList([]);
    if (web3) {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const BIG_TEN = new BigNumber(10);
      const roundIDList = [];
      const priceList = [];
      const timestampList = [];
      const timestampList1 = [];

      try {
        // 1. 가장 최근의 roundId로 해당 가격과 timestamp를 가져온다.
        const result: any = await contract.methods.latestRound().call();
        const roundID = new BigNumber(result);
        const roundID_str = roundID.toString();
        setLatestRound(roundID_str);

        // 2. 가장 최근의 roundId를 기준으로 과거 9개의 roundId들을 가져와 id리스트를 만든다.
        for (let i = 9; i >= 1; i--) {
          const roundIDMinus = roundID.minus(i);
          roundIDList.push(roundIDMinus.toString());
        }
        roundIDList.push(roundID_str);
        setRoundIDList(roundIDList);

        //getAnswer 호출
        const answer = new BigNumber(
          await contract.methods.getAnswer(roundID_str).call()
        );
        const BIG_TEN = new BigNumber(10);
        const answer_Big = answer.dividedBy(BIG_TEN.pow(8)).toFixed(2); // 10^8로 나누고, 소수점 두 자리까지
        const answer_str = answer_Big.toString();
        setAnswer(answer_str);

        //getTimestamp호출
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
        setTimestamp(formattedDate);

        // 3. 10개의 roundId에 대한 시간 데이터
        for (let i = 0; i < roundIDList.length; i++) {
          try {
            const timestamp = new BigNumber(
              await contract.methods.getTimestamp(roundIDList[i]).call()
            );
            const date = new Date(timestamp.toNumber() * 1000); //1000곱해서 밀리초로 변환
            timestampList1.push(date);
          } catch (error) {
            console.error(error);
          }
        }

        // 4. 가장 최근 roundId의 timestamp를 기준으로 1분간격으로 과거 10분간에 해당하는 timestamp리스트2를 만든다.
        //const latestDate = timestampList1[timestampList1.length - 1];
        // 4. 수정! 현재 시간을 기준으로 1분간격으로 과거 10분간에 해당하는 timestamp리스트2를 만든다.
        const currentTime = new Date();
        const timestampList2 = Array.from(
          { length: 10 },
          (_, i) => new Date(currentTime.getTime() - i * 60 * 1000)
        );

        // 5. 시간 비교연산
        const tempPriceList = [];
        const tempRoundIDList = [];
        const tempTimestampList = [];

        for (const target of timestampList2) {
          let matchingPrice = answer_str;

          for (let i = timestampList1.length - 1; i >= 0; i--) {
            if (target >= timestampList1[i]) {
              matchingPrice = new BigNumber(
                await contract.methods.getAnswer(roundIDList[i]).call()
              )
                .dividedBy(BIG_TEN.pow(8))
                .toFixed(2)
                .toString();
              tempRoundIDList.push(roundIDList[i]);
              break;
            }
          }
          const year = target.getFullYear();
          const month = String(target.getMonth() + 1).padStart(2, "0");
          const day = String(target.getDate()).padStart(2, "0");
          const hours = String(target.getHours()).padStart(2, "0");
          const minutes = String(target.getMinutes()).padStart(2, "0");
          const seconds = String(target.getSeconds()).padStart(2, "0");
          const formattedDate = `${year}년 ${month}월 ${day}일 ${hours}:${minutes}:${seconds}`;
          tempTimestampList.push(formattedDate);
          tempPriceList.push(matchingPrice);
        }
        console.log(tempRoundIDList);
        console.log(tempTimestampList);
        console.log(tempPriceList);
        setRoundIDList(tempRoundIDList.reverse());
        setTimestampList(tempTimestampList.reverse());
        setPriceList(tempPriceList.reverse());
      } catch (error) {
        console.error("데이터 불러오는데 실패 : ", error);
      }
    }
  };

  return (
    <>
      <GetData
        handleGetDataClick={handleGetDataClick}
        handleGetDataClick2={handleGetDataClick2}
        latestRound={latestRound}
        answer={answer}
        timestamp={timestamp}
      />
      <div className="flex flex-col w-60 mt-4 space-y-2">
        <h2 className="pt-5 pb-5 text-white self-center">roundID</h2>
        {roundIDList.length > 0
          ? roundIDList.map((roundID, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-black"
              >
                {roundID}
              </div>
            ))
          : Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-gray-400"
              >
                roundID #{i + 1}
              </div>
            ))}
      </div>
      <div className="flex flex-col w-60 mt-4 space-y-2">
        {displayMode == "CREATION" ? (
          <h2 className="pt-5 pb-5 text-white self-center">생성 Time</h2>
        ) : displayMode == "CURRENT" ? (
          <h2 className="pt-5 pb-5 text-white self-center">현재 Time</h2>
        ) : (
          <h2 className="pt-5 pb-5 text-white self-center">Time</h2>
        )}
        {timestampList.length > 0
          ? timestampList.map((timestamp, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-black"
              >
                {timestamp}
              </div>
            ))
          : Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-2 rounded bg-white border border-gray-300 text-center text-gray-400"
              >
                시간 정보 #{i + 1}
              </div>
            ))}
      </div>
      <div className="flex flex-col w-40 mt-4 space-y-2">
        <h2 className="pt-5 pb-5 text-white self-center">실제 Price</h2>
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
      </div>
      <div className="flex justify-center">
        <button
          onClick={handlePredBtnClick}
          className="mt-4 p-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
        >
          예측
          <br />
          하기
        </button>
      </div>
    </>
  );
};
