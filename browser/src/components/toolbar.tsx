import React from "react";
import styled from 'styled-components'

const Container = styled.div`
    background: #f9f9f9;
    box-sizing: border-box;
    padding: 10px 0;
    font-size: 0;
`

type Props = {
  onAddCell: () => void;
  onSessionRestart: () => void;
};

const Toolbar: React.FC<Props> = ({ onAddCell, onSessionRestart }) => {
  return (
    <Container>
      <button onClick={onAddCell}><i className="fas fa-plus"></i></button>
      <button onClick={onSessionRestart}><i className="fas fa-retweet"></i></button>
    </Container>
  );
};

export default Toolbar;
