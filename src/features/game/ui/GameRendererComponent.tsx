import React, {useEffect, useRef} from 'react';
import * as PIXI from "pixi.js";
import {GameControlsStateAccessor, GameRenderer, KillSwitch} from "../pixi/GameRenderer";
import {PixiGameData} from "../state/PixiGameData";
import {useDispatch, useStore} from "react-redux";
import {
    DisplayOptionsChange,
    GameControlsState,
    PlayState,
    resetControls,
    setDisplayOptions as setDisplayOptionsAction,
    setPlaySpeed as setPlaySpeedAction,
    setPlayState as setPlayStateAction,
} from "./gamecontrols/gameControlsSlice";
import {Store} from "redux";
import {RootState} from "../../../app/store";

// Setup PIXI app
function createPixiApp(): PIXI.Application {
    return new PIXI.Application({
        width: 800,
        height: 600,
        transparent: false,
        antialias: true,
        backgroundColor: 0x5a81dd,
    })
}

class ReduxGameControlsStateAccessor implements GameControlsStateAccessor {
    constructor(private readonly store: Store<RootState>, private readonly dispatch: any) {
    }

    getCurrentState(): GameControlsState {
        return this.store.getState().gameControls;
    }

    setDisplayOptions(change: DisplayOptionsChange): void {
        this.dispatch(setDisplayOptionsAction(change))
    }

    setPlaySpeed(playSpeed: number): void {
        this.dispatch(setPlaySpeedAction(playSpeed))
    }

    setPlayState(playState: PlayState): void {
        this.dispatch(setPlayStateAction(playState))
    }

}

function startAnimation(app: PIXI.Application, spritesheet: PIXI.Spritesheet, gameData: PixiGameData, killSwitch: KillSwitch, gameControlsStateAccessor: ReduxGameControlsStateAccessor) {
    const gameUi = new GameRenderer(app, gameData, spritesheet, gameControlsStateAccessor, killSwitch)
    // add the viewport to the stage
    app.stage.addChild(gameUi.viewport)
}

interface GameComponentProps {
    gameData: PixiGameData
}

export const GameRendererComponent = function(props: GameComponentProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const app = createPixiApp()

    const store = useStore()
    const dispatch = useDispatch()

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

    const killSwitch: KillSwitch = {
        kill: false,
        id: Math.random().toString(36).substring(7),
    }

    useEffect(() => {
        app.loader
            .add('overworld', 'overworld.json')
            .load((loader, resources) => {
                const overworld = resources.overworld?.spritesheet
                if (!overworld) throw new Error("could not load overworld texture atlas");
                startAnimation(app, overworld, props.gameData, killSwitch, new ReduxGameControlsStateAccessor(store, dispatch))
            });

        document.getElementById('pixi')?.appendChild(app.view);
        return () => {
            killSwitch.kill = true
            dispatch(resetControls())
        }
    })

    return (<div ref={divRef} id="pixi"/>)
}
