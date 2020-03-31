import React from "react";
import { useEffect, useState } from "react";
import Header from "./components/header";
import { Spinner } from "baseui/spinner";
import { styled } from "baseui";
import Content from "./layout/content";
import Cell from "./components/cell";
import Toolbar from "./components/toolbar";
import io from "socket.io-client";

const Centered = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%"
});

export default function App() {
  const [connection, setConnection] = useState(false);
  const [cellList, setCellList] = useState([1]);

  useEffect(() => {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    socket.on('socketID', (id: string) => {
      console.log("TCL: App -> socketID", id)
      socket.emit('session:start')
      document.title = "kernel connecting...";
    })
    socket.on('session:start:success', () => {
      document.title = "kernel connected";
      setConnection(true);
    })
  });

  const onAddCell = () => {
    let newCellList = JSON.parse(JSON.stringify(cellList));
    newCellList.push(1);
    setCellList(newCellList);
  };

  const getContent = () => (
    <div>
      {cellList.map((cell, index) => {
        return (
          <Content key={index}>
            <Cell />
          </Content>
        );
      })}
      <br />
      <Toolbar onAddCell={onAddCell} />
    </div>
  );

  return (
    <div className="App">
      <Header />
      <br />
      <Content />
      {connection ? (
        getContent()
      ) : (
          <Centered>
            <Spinner />
          </Centered>
        )}
    </div>
  );
}
