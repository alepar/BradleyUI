import React from 'react';
import {selectGameFileState} from "./fileselector/gameFileSlice";
import {useSelector} from "react-redux";
import {GameFileSelector} from "./fileselector/GameFileSelector";
import {GameRendererComponent} from "./GameRendererComponent";
import {GameControls} from "./GameControls";
import { Spinner } from 'react-bootstrap';
import styled from "styled-components";

const SpinnerDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const GameUIAndFileSelector = function() {
    const gameFile = useSelector(selectGameFileState);
    const gameName = gameFile.gameName;
    const gameData = gameFile.gameData;

    if (!gameName) {
        return <GameFileSelector/>
    }

    if (!gameData) {
        return (
            <SpinnerDiv>
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading game data...</span>
                </Spinner>
            </SpinnerDiv>
        )
    }

    return (
        <div id="game">
            <GameControls/>
            <GameRendererComponent gameData={gameData}/>
        </div>
    )
}
