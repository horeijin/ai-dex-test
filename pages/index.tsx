import Head from "next/head";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar/Navbar";
import { Inputbar } from "@/components/Inputbar/Inputbar";
import { Outputbar } from "@/components/Outputbar/Outputbar";

import Web3 from "web3";

const IndexPage = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [priceList, setPriceList] = useState<string[]>([]);
  const [predList, setPredList] = useState<string[]>([]);

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
    let url = "http://52.79.47.70:8000/predict/?";

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
      <main className="flex justify-center h-screen bg-gray-900">
        <div className="w-2/3 bg-opacity-20 backdrop-blur-md p-4">
          <Navbar
            web3={web3}
            account={account}
            network={network}
            connectMetaMask={connectMetaMask}
            disconnectMetaMask={disconnectMetaMask}
            setNetwork={setNetwork}
          />
          <div className="flex flex-row justify-center items-center space-x-20">
            <Inputbar
              handlePredBtnClick={handlePredBtnClick}
              web3={web3}
              priceList={priceList}
              setPriceList={setPriceList}
            />
            <Outputbar
              handleSendBtnClick={handleSendBtnClick}
              web3={web3}
              predList={predList}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;
