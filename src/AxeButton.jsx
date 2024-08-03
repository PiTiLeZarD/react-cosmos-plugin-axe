import React from "react";
import { IconButton32, InfoIcon } from "react-cosmos-ui";

export const AxeButton = ({ onClick }) => (
    <IconButton32 icon={<InfoIcon />} title="Open fixture source (S)" onClick={onClick} />
);
