import {GameData, Node, NodeType, TurnData} from "../../../protots/bradleyinterface_pb";
import {UIGameData, UIMapData, UITurnData} from "./UIGameData";
import {TerrainType} from "../ui/SpriteFactories";
import * as PIXI from "pixi.js";

class ProtobufBackedUIMapData implements UIMapData {

    private readonly map: Map<string, Node>
    private readonly size: PIXI.IPointData

    constructor(mapList: Array<Node>) {
        let maxx = 0
        let maxy = 0

        for (const node of mapList) {
            const coord = node.getCoordinate();
            if (coord) {
                const x = coord.getX();
                const y = coord.getY();

                if (x > maxx) maxx = x
                if (y > maxy) maxy = y
            }
        }

        this.size = {x: maxx+1, y:maxy+1}
        this.map = new Map<string, Node>()

        for (const node of mapList) {
            const coord = node.getCoordinate();
            if (coord) {
                const x = coord.getX();
                const y = coord.getY();

                this.map.set(this.makeKey(x, y), node)
            }
        }
    }

    makeKey(x: number, y: number): string {
        return `${x},${y}`
    }


    getSize(): PIXI.IPointData {
        return this.size;
    }

    getTerrainTypeAt(x: number, y: number): TerrainType {
        const node = this.map.get(this.makeKey(x, y))
        if (node) {
            switch(node.getNodetype()) {
                case NodeType.OPEN_NODE: return TerrainType.GRASS
                case NodeType.EXIT_NODE: return TerrainType.GRASS
                case NodeType.WALL_NODE: return TerrainType.WATER
                default: return TerrainType.WATER
            }
        } else {
            return TerrainType.WATER
        }
    }

    getExitPos(): PIXI.IPointData {
        let exitPos: PIXI.IPointData | undefined
        this.map.forEach(node => {
            if (node.getNodetype() === NodeType.EXIT_NODE) {
                const coordinate = node.getCoordinate();
                if (coordinate) {
                    exitPos = {x: coordinate.getX(), y: coordinate.getY()}
                }
            }
        })

        if (exitPos) {
            return exitPos
        }
        throw new Error("no exit found on map")
    }

}

class ProtobufBackedUITurnData implements UITurnData {

    constructor(private readonly turnNr: number, private readonly turnData: TurnData, private readonly radius: number) {
    }

    getObserved(): PIXI.IPointData[] {
        return this.getVisible()
    }

    getHero(): PIXI.IPointData {
        const hero = this.turnData.getHero()
        if (!hero) throw new Error("no hero at " + this.turnNr)
        return {x: hero.getX(), y: hero.getY()}
    }

    getVisible(): PIXI.IPointData[] {
        const visiblePoints: PIXI.IPointData[] = [];
        const heroPos = this.getHero();
        const radius2 = this.radius*this.radius

        for(let x=heroPos.x-this.radius; x<=heroPos.x+this.radius; x++) {
            for(let y=heroPos.y-this.radius; y<=heroPos.y+this.radius; y++) {
                let dx = x-heroPos.x
                dx = dx*dx
                let dy = y-heroPos.y
                dy = dy*dy
                if (dx+dy<=radius2) {
                    visiblePoints.push({x: x, y: y})
                }
            }
        }

        return visiblePoints;
    }

}

export class ProtobufBackedUIGameData implements UIGameData {

    private readonly pb: GameData

    constructor(pbGameData: GameData) {
        this.pb = pbGameData
    }

    getMap(): UIMapData {
        return new ProtobufBackedUIMapData(this.pb.getMapList())
    }

    getTurnCount(): number {
        return this.pb.getTurnsList().length;
    }

    getTurnState(turnNr: number): UITurnData {
        return new ProtobufBackedUITurnData(turnNr, this.pb.getTurnsList()[turnNr], this.pb.getVisibilityradius())
    }


}
