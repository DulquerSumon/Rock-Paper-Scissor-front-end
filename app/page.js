"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

function Home() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col text-white xm:text-green-600 sm:text-blue-800 xs:text-red-600 min-h-screen justify-center items-center py-2">
      Welcome to the game!
    </div>
  );
}
export default Home;
