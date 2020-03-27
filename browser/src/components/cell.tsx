import * as React from "react";
import { useState } from "react";
import { Card, StyledBody, StyledAction } from "baseui/card";
import { Button } from "baseui/button";
import { Textarea } from "baseui/textarea";
import * as api from "../api";

export default () => {
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");

  const runCell = (value: string) => {
    fetch(api.runcell, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: value })
    })
      .then(res => res.json())
      .then((res: any) => {
        if (res.status !== "ok") return;

        let result = "";
        res.data.msgList.forEach((msg: any) => {
          let type = msg.msg_type;
          let content = msg.content;
          switch (type) {
            case "execute_result":
              result = content.data["text/plain"];
              break;
            case "stream":
              result = content.text;
              break;
          }
        });
        setResult(result);
      });
  };

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <StyledBody>
        <Textarea
          value={value}
          onChange={e => setValue(e.currentTarget.value)}
        />
      </StyledBody>
      <StyledAction>
        <Button
          overrides={{ BaseButton: { style: { width: "100%" } } }}
          onClick={runCell.bind(null, value, setResult)}
        >
          run cell
        </Button>
      </StyledAction>
      {result ? <pre>{result}</pre> : ""}
    </Card>
  );
};
