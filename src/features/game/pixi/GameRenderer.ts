import {PixiGameData} from "../state/PixiGameData";
import {Viewport} from "pixi-viewport";
import * as PIXI from 'pixi.js'
import {OverworldTerrainSpriteFactory} from "./SpriteFactories";
import {FogOfWar} from "./FogOfWar";
import {Character} from "./Character";
import {
    DisplayOptions,
    DisplayOptionsChange,
    GameControlsState,
    PlayMode,
    PlayState
} from "../ui/gamecontrols/gameControlsSlice";

export interface KillSwitch {
    id: string,
    kill: boolean
}

export interface GameControlsStateAccessor {
    getCurrentState(): GameControlsState

    setPlayState(playState: PlayState) : void
    setPlaySpeed(playSpeed: number): void
    setDisplayOptions(change: DisplayOptionsChange): void
}

export class GameRenderer {
    // Constructed private deps
    private readonly terrainLayer: PIXI.Container
    private readonly mapObjectsLayer: PIXI.Container
    private readonly gridLayer: PIXI.Container
    private readonly characterLayer: PIXI.Container
    private readonly fogOfWar: FogOfWar
    private readonly hero: Character;
    private readonly ticker: PIXI.Ticker;

    // Constructed exported deps
    readonly viewport: Viewport

    // Internal render state
    private lastBaseTurn: number = 0
    private lastRoundTurn: number = 0
    private currentTurn: number = 0
    // Last observed state of controls
    private lastControlPlayMode: PlayMode = PlayMode.PLAY

    constructor(
            private readonly pixiApp: PIXI.Application,
            private readonly gameData: PixiGameData,
            private readonly spritesheet: PIXI.Spritesheet,
            private readonly controlStateAccessor: GameControlsStateAccessor,
            private readonly killSwitch: KillSwitch
    ) {
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
        this.ticker = this.pixiApp.ticker
        this.ticker.add(() => this.mainLoop());
    }

    mainLoop() {
        if (this.killSwitch.kill) {
            this.destroy();
            return
        }

        const controlState = this.controlStateAccessor.getCurrentState()
        this.updateDisplayOptions(controlState.displayOptions)

        const curControlPlayMode = controlState.playMode

        switch(controlState.playMode) {
            case PlayMode.PLAY:
                this.playLoop(controlState)
                break
            case PlayMode.PAUSE:
                this.pauseLoop(controlState)
                break
        }

        this.lastControlPlayMode = curControlPlayMode
        this.lastRoundTurn = Math.round(this.currentTurn)
    }


    private destroy() {
        this.ticker.remove(this.mainLoop)
        this.ticker.stop()
        this.pixiApp.destroy(true)
    }

    private buildViewport(): Viewport {
        const viewport = new Viewport({
            // screenWidth: 1400,//window.innerWidth,
            // screenHeight: 900,//window.innerHeight,
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

        this.updateFog(curTurn);

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

    private updateFog(curTurn: number) {
        const gameData = this.gameData;
        const turnState = gameData.getTurnState(curTurn);

        this.fogOfWar.update(
            gameData.getMap().getSize(),
            turnState.getVisible(),
            turnState.getObserved(),
        )
    }

    private renderTween(currentTurn: number) {
        this.hero.updateTween(currentTurn-Math.floor(currentTurn))
    }

    private updateDisplayOptions(opts: DisplayOptions) {
        this.gridLayer.visible = opts.showGrid
    }

    private playLoop(controlState: GameControlsState) {
        const currentTurn = (this.currentTurn += 1.0/this.ticker.FPS);
        const curBaseTurn = Math.floor(currentTurn)

        if (curBaseTurn !== this.lastBaseTurn || this.lastControlPlayMode !== PlayMode.PLAY) {
            this.renderBaseTurn(curBaseTurn)
            this.lastBaseTurn = curBaseTurn
        }

        const currentRoundTurn = Math.round(currentTurn);
        if (currentRoundTurn !== this.lastRoundTurn) {
            this.controlStateAccessor.setPlayState({currentTurn: currentRoundTurn, playMode: PlayMode.PLAY})
            this.updateFog(currentRoundTurn)
        }

        if (currentTurn >= this.gameData.getTurnCount()-1) {
            this.controlStateAccessor.setPlayState({currentTurn: this.gameData.getTurnCount()-1, playMode: PlayMode.PAUSE})
        } else {
            this.renderTween(currentTurn)
        }
    }

    private pauseLoop(controlState: GameControlsState) {
        const curBaseTurn = controlState.currentTurn
        if (curBaseTurn !== this.lastBaseTurn || this.currentTurn !== curBaseTurn || this.lastControlPlayMode !== PlayMode.PAUSE) {
            this.renderBaseTurn(curBaseTurn)
            this.hero.setCoordinates(this.hero.getSrc(), this.hero.getSrc())
            this.lastBaseTurn = curBaseTurn
            this.currentTurn = curBaseTurn
        }
    }
}