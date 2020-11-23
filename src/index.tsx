import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as PIXI from 'pixi.js'
import {GameControlState, GameUI} from "./features/game/ui/GameUI";
import {UIGameData, UIMapData, UITurnData} from "./features/game/state/UIGameData";
import {TerrainType} from "./features/game/ui/SpriteFactories";
import {GameData} from "./protots/bradleyinterface_pb";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <div id="pixi"/>
      {/*<App />*/}
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

fetch('./bradleygame.pb').then(response => {
    response.arrayBuffer().then(buf => {
        const gameData = GameData.deserializeBinary(new Uint8Array(buf));
        for (const turn of gameData.getTurnsList()) {
            console.log(turn.getHero()?.getX(), turn.getHero()?.getY())
        }
    })
})

// Setup PIXI app
const app = new PIXI.Application({
    width: 1400,
    height: 900,
    transparent: false,
    antialias: true,
    backgroundColor: 0x5a81dd,
})

document.getElementById('pixi')?.appendChild(app.view);

/*const stringmap = [
    ".....X...",
    ".....X...",
    "..XXXX...",
    ".XX......",
    ".X.......",
    ".X.......",
    ".X.......",
    ".........",
]*/
/*
const stringmap = [
"......X...",
"......X...",
"...XXXX...",
"..XX......",
"..X.......",
"..X.......",
"..X.......",
"..........",
"..........",
]
*/
/*
const stringmap = [
    "....XXXX",
    "..XXX..X",
    "..XXXX.X",
    ".XXXX..X",
    "XXXXXX.X",
    ".XXXX..X",
    "..XXXX.X",
    "..XXX..X",
    "....XXXX",
]
*/

const stringmap = [
    "X....XXXXXXXXXXXXXXXXXXXX",
    "XX.....XXXXXXXXXXXXXX...X",
    "XX.....XXXXXXXXXXXXX...XX",
    "X....XXXX.XXXXXXXXXXXXXXX",
    "XXX....XX....X..X.......X",
    "XX.....XX................",
    "X.....XXX................",
    ".......XXX...............",
    ".....XXXX................",
    "X......XXXX..............",
    "XXXXXXXXXXXXXXXX..XXXX..X",
    "XXXXXXXXXXXXXXX....XX....",
    "XXXXXXXXXXXXXXXXXXXXXXXXX",
]

class StringBackedMap implements UIMapData {

    stringmap: string[]
    size: PIXI.IPointData;

    constructor(arr: string[]) {
        this.stringmap = arr

        let x = 0
        for (let y=0; y<arr.length; y++) {
            const row = arr[y]
            if (row.length > x) {
                x = row.length
            }
        }

        this.size = {x: x, y: arr.length}
    }

    getSize(): PIXI.IPointData {
        return this.size;
    }

    getTerrainTypeAt(x: number, y: number): TerrainType {
        return this.get(x, y)
    }

    get(x: number, y: number) {
        if (y<0 || y >= this.stringmap.length) {
            return 1
        }

        const row = this.stringmap[y]

        if (x<0 || x >= row.length) {
            return 1
        }

        switch (row[x]) {
            case 'X': return 1
            case '.': return 0
            default: throw new Error("unknown literal in map")
        }
    }
}

// load the texture we need
app.loader
    .add('overworld', 'overworld.json')
    .load((loader, resources) => {
        const overworld = resources.overworld?.spritesheet
        if (!overworld) throw new Error("could not load overworld texture atlas");


        const map = new StringBackedMap(stringmap)
        const gameData: UIGameData = {
            getMap(): UIMapData {
                return map;
            }, getTurnState(turnNr: number): UITurnData {
                return {};
            }
        }
        const gameUi = new GameUI(app, gameData, overworld, new GameControlState())

        // add the viewport to the stage
        app.stage.addChild(gameUi.viewport)
    });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
