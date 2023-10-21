import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { useDispatch } from "react-redux";
import { setCurrentAccount } from "../slices/viewFunctions/viewSlice";
import { useSelector } from "react-redux";
import { ethers, toBigInt } from "ethers";
import {
  expectedChainId,
  gameAbi,
  gameAddress,
  rpcProvider,
  tokenAbi,
  tokenAddress,
} from "./constants";
import { toast } from "react-toastify";
import { shortenAddress } from "@/utils/shortenAddress";
export const writeFunctions = () => {
  const { connector, hooks, useContract, provider, signer } = useWeb3React();
  const {
    useSelectedAccount,
    useSelectedChainId,
    useSelectedIsActive,
    useSelectedIsActivating,
  } = hooks;
  const getSigner = () => {
    // const { provider, signer } = useWeb3React();
    return signer || provider?.getSigner();
  };
  const dispatch = useDispatch();
  const successNotification = (msg) => toast(msg);
  const errorNotification = (msg) => toast(msg);

  const isActivating = useSelectedIsActivating(connector);
  const isActive = useSelectedIsActive(connector);
  const account = useSelectedAccount(connector);
  const chain = useSelectedChainId(connector);

  const currentAccount = useSelector(
    (state) => state.viewFunctions.currentAccount
  );

  const fetchGameContract = (signerOrProvider) => {
    return new ethers.Contract(gameAddress, gameAbi, signerOrProvider);
  };
  const fetchTokenContract = (signerOrProvider) => {
    return new ethers.Contract(tokenAddress, tokenAbi, signerOrProvider);
  };

  const createGame = async (amount, router) => {
    try {
      const signer = await getSigner();
      // const contract = useContract(gameAbi, gameAddress);
      const contract = fetchGameContract(signer);
      const formattedAmount = ethers.parseEther(amount);
      const tContract = fetchTokenContract(signer);
      const allowance = await tContract.allowance(currentAccount, gameAddress);
      if (allowance < formattedAmount) {
        await approve(formattedAmount);
      }
      const tx = await contract.createGame(formattedAmount);
      const id = await contract.getGameId();
      // console.log(tx);
      successNotification(
        `You have successfully created a game of game id ${(
          toBigInt(id) + toBigInt(1)
        ).toString()}`
      );
      successNotification(
        "You will be redirect to home page in couple of secons"
      );
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      console.log(error);
      errorNotification(
        error.message.slice(0, 300) ||
          "Something went wrong while creating the game, please try again"
      );
    }
  };

  const joinGame = async (id, amount) => {
    try {
      const signer = await getSigner();
      const contract = fetchGameContract(signer);
      // const formattedAmount = ethers.parseEther(amount);
      const tContract = fetchTokenContract(signer);
      const allowance = await tContract.allowance(currentAccount, gameAddress);
      if (allowance < amount) {
        console.log(amount, allowance, allowance < amount);
        await approve(amount);
      }
      const tx = await contract.joinGame(id);
      const response = await toast.promise(
        tx.provider.waitForTransaction(tx.hash, 1, 10000),
        {
          pending: "Joining game...",
          success: "Successfully joined the game!",
          error: (error) => `Failed to join the game: ${error.message}`,
        }
      );
      console.log(response);
      successNotification(
        `You have successfully joined the game of game id ${id.toString()}`
      );
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.log(error);
      errorNotification(
        error.message.slice(0, 300) ||
          "Something went wrong while joinig the game, please try again"
      );
    }
  };
  const commitGame = async (id, move, salt) => {
    try {
      const signer = await getSigner();
      const contract = fetchGameContract(signer);
      console.log(id, move, salt);
      const tx = await contract.commitMove(id, move, salt);
      const response = await toast.promise(
        tx.provider.waitForTransaction(tx.hash, 1, 10000),
        {
          pending: "Commiting game...",
          success: "Successfully commited the game!",
          error: (error) => `Failed to commited the game: ${error.message}`,
        }
      );
      console.log(response);
      successNotification(
        `You have successfully commited the game of game id ${id.toString()}`
      );
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.log(error);
      errorNotification(
        error.message.slice(0, 300) ||
          "Something went wrong while commited the game, please try again"
      );
    }
  };
  const revealGame = async (id, move, salt) => {
    try {
      const signer = await getSigner();
      const contract = fetchGameContract(signer);
      const tx = await contract.revealMove(id, move, salt);
      const response = await toast.promise(
        tx.provider.waitForTransaction(tx.hash, 1, 10000),
        {
          pending: "Revealing game...",
          success: "Successfully revealed the game!",
          error: (error) => `Failed to revealed the game: ${error.message}`,
        }
      );
      console.log(response);
      successNotification(
        `You have successfully revealed the game of game id ${id.toString()}`
      );
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.log(error);
      errorNotification(
        error.message.slice(0, 300) ||
          "Something went wrong while revealed the game, please try again"
      );
    }
  };

  const approve = async (amount) => {
    try {
      const signer = await getSigner();
      const contract = fetchTokenContract(signer);
      const bal = await contract.balanceOf(gameAddress);
      console.log(bal);
      const tx = await contract.approve(gameAddress, amount);
      console.log(tx);
      // const txr = await tx.provider.waitForTransaction(tx.hash, 1, 10000);
      const response = await toast.promise(
        tx.provider.waitForTransaction(tx.hash, 1, 10000),
        {
          pending: "Joining game...",
          success: "Successfully approved the token!",
          error: (error) => `Failed to join the game: ${error.message}`,
        }
      );
      console.log(response);
      // console.log(txr);
      successNotification(
        `You have successfully approved ${shortenAddress(
          gameAddress
        )} to spend ${ethers.formatEther(amount)} tokens `
      );
    } catch (error) {
      console.log(error);
      errorNotification(
        error.message.slice(0, 300) ||
          "Something went wrong while approving token, please try again"
      );
    }
  };

  return {
    account,
    chain,
    isActivating,
    isActive,
    currentAccount,
    createGame,
    joinGame,
    commitGame,
    revealGame,
  };
};
