import * as React from "react";
import Toolbar from './toolbar'

interface IProps {
  onAddCell(): void
  onSessionRestart(): void
}

const Header: React.FC<IProps> = (props) => {
  return (
    <>
      <div>Notebook</div>
      <Toolbar onAddCell={props.onAddCell} onSessionRestart={props.onSessionRestart} />
    </>
  );
}

export default Header