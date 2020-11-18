import {GameData} from "../state/GameData";
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

function calculateVisible(heroX: number, heroY: number) {
    const visible: PIXI.IPointData[] = [];
    for(let x=heroX-2; x<=heroX+2; x++) {
        for(let y=heroY-2; y<=heroY+2; y++) {
            visible.push({x: x, y: y})
        }
    }
    return visible
}

function calculateObserved() {
    const observed: PIXI.IPointData[] = [];
    for(let x=-2; x<=6; x++) {
        for(let y=-2; y<=6; y++) {
            observed.push({x: x, y: y})
        }
    }
    return observed
}

export class GameUI {
    // Injected deps
    private pixiApp: PIXI.Application;
    private gameData: GameData
    private spritesheet: PIXI.Spritesheet;
    private controlState: GameControlState

    // Constructed private deps
    private terrainLayer: PIXI.Container
    private gridLayer: PIXI.Container
    private characterLayer: PIXI.Container
    private fogOfWar: FogOfWar
    private baseTweenTurn: number = 0

    // Constructed exported deps
    readonly viewport: Viewport

    constructor(pixiApp: PIXI.Application, gameData: GameData, spritesheet: PIXI.Spritesheet, controlState: GameControlState) {
        this.gameData = gameData
        this.pixiApp = pixiApp
        this.spritesheet = spritesheet
        this.controlState = controlState

        this.viewport = this.buildViewport()

        this.terrainLayer = this.buildTerrainLayer()
        this.gridLayer = this.buildGridLayer()
        this.characterLayer = new PIXI.Container()
        this.fogOfWar = new FogOfWar()

        this.viewport.addChild(this.terrainLayer)

        this.gridLayer.position.set(8, 8)
        this.viewport.addChild(this.gridLayer)

        this.characterLayer.position.set(8, 8)
        this.viewport.addChild(this.characterLayer)

        this.fogOfWar.container.position.set(8, 8)
        this.viewport.addChild(this.fogOfWar.container)

        const hero = new Character(this.spritesheet, "character/hero");
        this.characterLayer.addChild(hero.container)
        hero.setv(1, 0)

        this.fogOfWar.update(
            this.gameData.getMap().getSize(),
            calculateVisible(0, 0),
            calculateObserved()
        )

        // Listen for frame updates
        pixiApp.ticker.add(() => {
            hero.step()

            if (hero.container.x > 4 * 16) {
                hero.container.x = 4 * 16
                hero.setv(0, 1)
            } else if (hero.container.y > 4 * 16) {
                hero.container.y = 4 * 16
                hero.setv(-1, 0)
            } else if (hero.container.x < 0) {
                hero.container.x = 0
                hero.setv(0, -1)
            } else if (hero.container.y < 0) {
                hero.container.y = 0
                hero.setv(1, 0)
            }

            const heroX = Math.floor(hero.container.x/16)
            const heroY = Math.floor(hero.container.y/16)
            this.fogOfWar.update(
                this.gameData.getMap().getSize(),
                calculateVisible(heroX, heroY),
                calculateObserved()
            )
        });

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
}