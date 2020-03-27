import React from "react";
// import { useEffect, useState } from "react";
import { ButtonGroup } from "baseui/button-group";
import { Button } from "baseui/button";
import Content from "../layout/content";

type Props = {
  onAddCell: () => void;
};

const Toolbar: React.FunctionComponent<Props> = ({ onAddCell }) => {
  return (
    <Content>
      <ButtonGroup>
        <Button onClick={onAddCell}>+</Button>
      </ButtonGroup>
    </Content>
  );
};

export default Toolbar;
