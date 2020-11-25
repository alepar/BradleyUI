import React from 'react';
import {selectGameData} from "./fileselector/gameFileSlice";
import {useSelector} from "react-redux";
import {GameFileSelector} from "./fileselector/GameFileSelector";
import {GameComponent} from "./GameComponent";

export const GameUIAndFileSelector = function() {
    const gameData = useSelector(selectGameData)
    if (!gameData) {
        return <GameFileSelector/>
    }

    return (<>
        <GameFileSelector/>
        <GameComponent gameData={gameData}/>
    </>)
}
