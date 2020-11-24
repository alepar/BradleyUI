import {TerrainType} from "../ui/SpriteFactories";

export interface UIGameData {
    getTurnState(turnNr: number): UITurnData
    getTurnCount(): number
    getMap(): UIMapData
}

export interface UITurnData {
    getObserved(): PIXI.IPointData[]
    getVisible(): PIXI.IPointData[]
    getHero(): PIXI.IPointData
}

export interface UIMapData {
    getSize(): PIXI.IPointData
    getTerrainTypeAt(x: number, y: number): TerrainType
    getExitPos(): PIXI.IPointData;
}
