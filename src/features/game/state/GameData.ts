import {TerrainType} from "../ui/SpriteFactories";

export interface GameData {
    getTurnState(turnNr: number): TurnData
    getMap(): MapData
}

export interface TurnData {

}

export interface MapData {
    getSize(): PIXI.IPointData
    getTerrainTypeAt(x: number, y: number): TerrainType
}
