import {TerrainType} from "../ui/SpriteFactories";

export interface UIGameData {
    getTurnState(turnNr: number): UITurnData
    getMap(): UIMapData
}

export interface UITurnData {

}

export interface UIMapData {
    getSize(): PIXI.IPointData
    getTerrainTypeAt(x: number, y: number): TerrainType
}
