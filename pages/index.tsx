import Head from "next/head";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar/Navbar";
import { Inputbar } from "@/components/Inputbar/Inputbar";
import { Outputbar } from "@/components/Outputbar/Outputbar";

import Web3 from "web3";

import BigNumber from "bignumber.js";
import { contractABI, contractAddress } from "@/utils";

const IndexPage = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [priceList, setPriceList] = useState<string[]>([]);
  const [predList, setPredList] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<
    "CREATION" | "CURRENT" | undefined
  >();

  //Inputbar 컴포넌트에서 가져옴
  const [latestRound, setLatestRound] = useState("");
  const [answer, setAnswer] = useState("");
  const [timestamp, setTimestamp] = useState("");

  //함수 1 : 메타마스크 연결
  const connectMetaMask = async () => {
    let currentWeb3 = web3;

    //현재 web3 인스턴스 없으면 새로 생성
    if (
      !currentWeb3 &&
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      currentWeb3 = new Web3(window.ethereum);
      setWeb3(currentWeb3);
    }

    if (currentWeb3) {
      try {
        const accounts = await currentWeb3.eth.requestAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("메타마스크 연결에 실패 : ", error);
      }
    }
  };

  //함수 2 : 메타마스크 연결 해제
  const disconnectMetaMask = () => {
    setWeb3(null);
    setAccount(null);
    setNetwork(null);
  };

  //함수 3 : 가격 데이터 10개를 예측모델에 전달하고 응답 받기
  const handlePredBtnClick = async () => {
    console.log("예측 모델에게 가격 정보들을 보냅니다.");

    //Django 서버의 PredictView URL
    //let url = "http://52.79.47.70:8000/predict/?"; //구 서버
    let url = "http://3.39.192.169:8000/predict/?"; //신 서버
    //let url = "http://localhost:8000/predict/?";
    console.log("예측모델 서버 주소 : ", url);
    console.log(priceList);

    //priceList의 10개의 값을 쿼리 파라미터로 추가
    if (priceList) {
      priceList.forEach((price, index) => {
        url += `&input_data_${index}=${price}`;
      });
    }

    //fetch로 GET요청
    const response = await fetch(url);
    //const responseText = await response.text();
    //console.log(responseText);
    const data = await response.json();

    const tempPredList = data.prediction;
    setPredList(tempPredList);
    console.log("예측값들을 가져왔습니다.");
  };

  //함수 4 : 예측값들을 스마트 컨트랙트로 전달
  const handleSendBtnClick = async () => {
    console.log("스마트 컨트랙트로 전송합니다. (미구현)");
  };

  //함수 5 : 가격 조회+예측모델로 전송+예측값 받아오기 한 번에 실행
  const handleOneClick = async () => {
    //(1) 가격 가져오기
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

    //(2) 예측모델로 가격 정보 보내고, 예측값 가져오기
    console.log("예측 모델에게 가격 정보들을 보냅니다.");

    //Django 서버의 PredictView URL
    //let url = "http://52.79.47.70:8000/predict/?"; //로직 수정 전 인스턴스 서버
    let url = "http://3.39.192.169:8000/predict/?"; //로직 수정 후 인스턴스 서버
    //let url = "http://localhost:8000/predict/?";
    console.log("예측모델 서버 주소 : ", url);
    console.log("보내는 값들 : ", priceList);

    //priceList의 10개의 값을 쿼리 파라미터로 추가
    if (priceList) {
      priceList.forEach((price, index) => {
        url += `&input_data_${index}=${price}`;
      });
    }

    //fetch로 GET요청
    const response = await fetch(url);
    //const responseText = await response.text();
    //console.log(responseText);
    const data = await response.json();

    const tempPredList = data.prediction;
    setPredList(tempPredList);
    console.log("예측값들을 가져왔습니다.");
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      web3Instance.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });

      //이벤트 리스너 : 계정이 변경 감지
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setAccount(accounts[0]);
      });

      //이벤트 리스너 : 연결 해제 감지
      window.ethereum.on("disconnect", () => {
        setAccount(null);
      });
    } else {
      console.error("이더리움 네트워크 연결이 되지 않았습니다.");
    }

    //useEffect가 종료될 때 이벤트 리스너 제거
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("disconnect");
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Head>
        <title>ETH/USD Price</title>
        <meta name="description" content="How much is the ETH?" />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
      </Head>
      <main className="flex justify-center flex-grow bg-gray-900">
        <div className="w-full bg-opacity-20 backdrop-blur-md p-4">
          <Navbar
            web3={web3}
            account={account}
            network={network}
            connectMetaMask={connectMetaMask}
            disconnectMetaMask={disconnectMetaMask}
            setNetwork={setNetwork}
          />
          <div className="flex flex-row justify-center items-center space-x-20">
            {/* <button
              onClick={handleOneClick}
              className="mt-4 bg-blue-400 p-2 rounded hover:bg-blue-600"
            >
              한 번에 실행
            </button> */}
            <Inputbar
              handlePredBtnClick={handlePredBtnClick}
              web3={web3}
              priceList={priceList}
              predList={predList}
              displayMode={displayMode}
              setPriceList={setPriceList}
              setPredList={setPredList}
              setDisplayMode={setDisplayMode}
            />
            <Outputbar
              handleSendBtnClick={handleSendBtnClick}
              web3={web3}
              predList={predList}
              displayMode={displayMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;
