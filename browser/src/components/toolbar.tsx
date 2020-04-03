import React from "react";

type Props = {
  onAddCell: () => void;
};

const Toolbar: React.FunctionComponent<Props> = ({ onAddCell }) => {
  return (
    <button onClick={onAddCell}>+</button>
  );
};

export default Toolbar;
