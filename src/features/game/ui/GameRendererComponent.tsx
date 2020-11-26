import React, {useEffect, useRef} from 'react';
import * as PIXI from "pixi.js";
import {GameControlState, GameRenderer} from "../pixi/GameRenderer";
import {PixiGameData} from "../state/PixiGameData";

// Setup PIXI app
function createPixiApp(): PIXI.Application {
    return new PIXI.Application({
        width: 128,
        height: 128,
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

export const GameRendererComponent = function(props: GameComponentProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const app = createPixiApp()

    useEffect(() => {
        const handleResize = () => {
            const curDiv = divRef.current;
            if (curDiv) {
                const width = curDiv.offsetWidth;
                const height = curDiv.offsetHeight;
                app.renderer.resize(width, height)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [divRef, app.renderer])

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

    return (<div ref={divRef} id="pixi"/>)
}
