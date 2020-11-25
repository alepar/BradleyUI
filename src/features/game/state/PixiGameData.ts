import {TerrainType} from "../pixi/SpriteFactories";

// This defines the game state data that is provided to PixiGame for rendering

export interface PixiGameData {
    getTurnState(turnNr: number): PixiTurnData
    getTurnCount(): number
    getMap(): PixiMapData
}

export interface PixiTurnData {
    getObserved(): PIXI.IPointData[]
    getVisible(): PIXI.IPointData[]
    getHero(): PIXI.IPointData
}

export interface PixiMapData {
    getSize(): PIXI.IPointData
    getTerrainTypeAt(x: number, y: number): TerrainType
    getExitPos(): PIXI.IPointData;
}
