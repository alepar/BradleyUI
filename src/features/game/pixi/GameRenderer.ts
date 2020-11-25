import {PixiGameData} from "../state/PixiGameData";
import {Viewport} from "pixi-viewport";
import * as PIXI from 'pixi.js'
import {OverworldTerrainSpriteFactory} from "./SpriteFactories";
import {FogOfWar} from "./FogOfWar";
import {Character} from "./Character";

export enum GamePlayMode {
    PLAY,
    STEP,
    PAUSE,
    STOP,
}

export class GameControlState {
    currentTurn: number = 0
    targetTurn: number = 0
    playMode: GamePlayMode = GamePlayMode.STOP
}

export class GameRenderer {
    // Injected deps
    private readonly pixiApp: PIXI.Application;
    private readonly gameData: PixiGameData
    private readonly spritesheet: PIXI.Spritesheet;
    private readonly controlState: GameControlState

    // Constructed private deps
    private readonly terrainLayer: PIXI.Container
    private readonly mapObjectsLayer: PIXI.Container
    private readonly gridLayer: PIXI.Container
    private readonly characterLayer: PIXI.Container
    private readonly fogOfWar: FogOfWar
    private readonly hero: Character;

    private lastBaseTurn: number = 0

    // Constructed exported deps
    readonly viewport: Viewport

    constructor(pixiApp: PIXI.Application, gameData: PixiGameData, spritesheet: PIXI.Spritesheet, controlState: GameControlState) {
        this.gameData = gameData
        this.pixiApp = pixiApp
        this.spritesheet = spritesheet
        this.controlState = controlState

        this.viewport = this.buildViewport()

        this.terrainLayer = this.buildTerrainLayer()
        this.mapObjectsLayer = this.buildMapObjectsLayer()
        this.gridLayer = this.buildGridLayer()
        this.characterLayer = new PIXI.Container()
        this.fogOfWar = new FogOfWar()

        this.viewport.addChild(this.terrainLayer)

        this.mapObjectsLayer.position.set(8, 8)
        this.viewport.addChild(this.mapObjectsLayer)

        this.gridLayer.position.set(8, 8)
        this.viewport.addChild(this.gridLayer)

        this.characterLayer.position.set(8, 8)
        this.viewport.addChild(this.characterLayer)

        this.fogOfWar.container.position.set(8, 8)
        this.viewport.addChild(this.fogOfWar.container)

        this.hero = new Character(this.spritesheet, "character/hero");
        this.characterLayer.addChild(this.hero.container)

        this.renderBaseTurn(0)

        // Listen for frame updates
        const ticker = pixiApp.ticker;
        const mainLoop = () => {
            this.controlState.currentTurn += 1.0/ticker.FPS
            const curBaseTurn = Math.floor(this.controlState.currentTurn)

            if (curBaseTurn !== this.lastBaseTurn) {
                this.renderBaseTurn(curBaseTurn)
                this.lastBaseTurn = curBaseTurn
            }

            if (this.controlState.currentTurn >= this.gameData.getTurnCount()-1) {
                ticker.remove(mainLoop)
            } else {
                this.renderTween(this.controlState.currentTurn)
            }
        }
        ticker.add(mainLoop);
    }


    private buildViewport(): Viewport {
        const viewport = new Viewport({
            screenWidth: 1400,//window.innerWidth,
            screenHeight: 900,//window.innerHeight,
            // worldWidth: 16*30,
            // worldHeight: 16*15,

            interaction: this.pixiApp.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()
        // .bounce()

        viewport
            .scale.set(3, 3)

        return viewport
    }

    private buildTerrainLayer(): PIXI.Container {
        const spriteFactory = new OverworldTerrainSpriteFactory(this.spritesheet)
        const terrain = new PIXI.Container()

        const map = this.gameData.getMap();
        const mapSize = map.getSize();
        for (let x = 0; x < mapSize.x + 1; x++) {
            for (let y = 0; y < mapSize.y + 1; y++) {
                const sprite = spriteFactory.create(
                    map.getTerrainTypeAt(x - 1, y - 1),
                    map.getTerrainTypeAt(x, y - 1),
                    map.getTerrainTypeAt(x, y),
                    map.getTerrainTypeAt(x - 1, y),
                )
                sprite.position.set(x * 16, y * 16)

                terrain.addChild(sprite)
            }
        }
        return terrain
    }

    private buildMapObjectsLayer(): PIXI.Container {
        const mapObjectsLayer = new PIXI.Container()
        const exitPos = this.gameData.getMap().getExitPos();
        const sprite = new PIXI.Sprite(this.spritesheet.textures["object/castle"]);
        sprite.position.set(exitPos.x*16, exitPos.y*16)
        mapObjectsLayer.addChild(sprite)
        return mapObjectsLayer
    }

    private buildGridLayer(): PIXI.Container {
        const map = this.gameData.getMap();
        const mapSize = map.getSize();

        const grid = new PIXI.Container()
        for (let x = 1; x < mapSize.x; x++) {
            const line = new PIXI.Graphics();
            line.lineStyle(1, 0xFFFFFF, 0.15);
            line.moveTo(x * 16, 0);
            line.lineTo(x * 16, 16 * mapSize.y);
            grid.addChild(line);
        }
        for (let y = 1; y < mapSize.y; y++) {
            const line = new PIXI.Graphics();
            line.lineStyle(1, 0xFFFFFF, 0.15);
            line.moveTo(0, y * 16);
            line.lineTo(16 * mapSize.x, y * 16);
            grid.addChild(line);
        }

        return grid
    }

    private renderBaseTurn(curTurn: number) {
        const gameData = this.gameData;
        const turnState = gameData.getTurnState(curTurn);

        this.fogOfWar.update(
            gameData.getMap().getSize(),
            turnState.getVisible(),
            turnState.getObserved(),
        )

        const curHeroPos = turnState.getHero();
        let nextHeroPos
        if (curTurn === gameData.getTurnCount()-1) {
            nextHeroPos = curHeroPos
        } else {
            nextHeroPos = gameData.getTurnState(curTurn+1).getHero()
        }

        const hero = this.hero;
        hero.setCoordinates(curHeroPos, nextHeroPos)
        hero.updateTween(0)
    }

    private renderTween(currentTurn: number) {
        this.hero.updateTween(currentTurn-Math.floor(currentTurn))
    }

}