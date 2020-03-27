import * as React from "react";
import { useStyletron } from "baseui";
import { Grid, Cell } from "baseui/layout-grid";

const Content: React.FunctionComponent<{}> = ({ children }) => (
  <Outer>
    <Grid>
      <Cell span={12}>
        <Inner>{children}</Inner>
      </Cell>
    </Grid>
  </Outer>
);

const Outer: React.FunctionComponent<{}> = ({ children }) => {
  const [css] = useStyletron();
  return <div className={css({})}>{children}</div>;
};

const Inner: React.FunctionComponent<{}> = ({ children }) => {
  const [css, theme] = useStyletron();
  return (
    <div
      className={css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: theme.colors.accent700
      })}
    >
      {children}
    </div>
  );
};

export default Content;
