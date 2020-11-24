import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as PIXI from 'pixi.js'
import {GameControlState, GameUI} from "./features/game/ui/GameUI";
import {UIGameData} from "./features/game/state/UIGameData";
import {GameData} from "./protots/bradleyinterface_pb";
import {ProtobufBackedUIGameData} from "./features/game/state/ProtobufGameData";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <div id="pixi"/>
      {/*<App />*/}
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// Setup PIXI app
const app = new PIXI.Application({
    width: 1400,
    height: 900,
    transparent: false,
    antialias: true,
    backgroundColor: 0x5a81dd,
})

document.getElementById('pixi')?.appendChild(app.view);

// load the texture we need
app.loader
    .add('overworld', 'overworld.json')
    .load((loader, resources) => {
        const overworld = resources.overworld?.spritesheet
        if (!overworld) throw new Error("could not load overworld texture atlas");

        spritesheet = overworld

        startAnimation()
    });

fetch('./bradleygame.pb').then(response => {
    response.arrayBuffer().then(buf => {
        const pbGameData = GameData.deserializeBinary(new Uint8Array(buf));
        gameData = new ProtobufBackedUIGameData(pbGameData)
        startAnimation()
    })
})

let spritesheet: PIXI.Spritesheet | undefined
let gameData: UIGameData | undefined

function startAnimation() {
    if (spritesheet && gameData) {
        const gameUi = new GameUI(app, gameData, spritesheet, new GameControlState())
        // add the viewport to the stage
        app.stage.addChild(gameUi.viewport)
    }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
