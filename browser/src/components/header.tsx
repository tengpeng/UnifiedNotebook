import * as React from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from "baseui/header-navigation";
// import { StyledLink } from "baseui/link";
// import { Button } from "baseui/button";
import {} from "baseui/icon";

export default function Header() {
  return (
    <HeaderNavigation>
      <StyledNavigationList $align={ALIGN.left}>
        <StyledNavigationItem>Notebook</StyledNavigationItem>
      </StyledNavigationList>
    </HeaderNavigation>
  );
}
