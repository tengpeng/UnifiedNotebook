import React from "react";

type Props = {
  onAddCell: () => void;
  onSessionRestart: () => void;
};

const Toolbar: React.FunctionComponent<Props> = ({ onAddCell, onSessionRestart }) => {
  return (
    <div>
      <button onClick={onAddCell}>+</button>
      <button onClick={onSessionRestart}>restart</button>
    </div>
  );
};

export default Toolbar;
