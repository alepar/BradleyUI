import React, {useEffect} from 'react';
import {GameFileSelector} from "./fileselector/GameFileSelector";
import * as PIXI from "pixi.js";
import {GameControlState, GameRenderer} from "../pixi/GameRenderer";
import {PixiGameData} from "../state/PixiGameData";

// Setup PIXI app
function createPixiApp(): PIXI.Application {
    return new PIXI.Application({
        width: 1400,
        height: 900,
        transparent: false,
        antialias: true,
        backgroundColor: 0x5a81dd,
    })
}

function startAnimation(app: PIXI.Application, spritesheet: PIXI.Spritesheet, gameData: PixiGameData) {
    const gameUi = new GameRenderer(app, gameData, spritesheet, new GameControlState())
    // add the viewport to the stage
    app.stage.addChild(gameUi.viewport)
}

interface GameComponentProps {
    gameData: PixiGameData
}

export const GameComponent = function(props: GameComponentProps) {

    const app = createPixiApp()

    // load texture
    app.loader
        .add('overworld', 'overworld.json')
        .load((loader, resources) => {
            const overworld = resources.overworld?.spritesheet
            if (!overworld) throw new Error("could not load overworld texture atlas");
            startAnimation(app, overworld, props.gameData)
        });

    useEffect(() => {
        document.getElementById('pixi')?.appendChild(app.view);
        return () => {
            app.destroy()
        }
    })

    return (<div id="pixi" />)
}
