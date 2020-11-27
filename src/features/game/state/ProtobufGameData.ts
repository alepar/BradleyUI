import {Coordinate, GameData, Node, NodeType} from "../../../protots/bradleyinterface_pb";
import {PixiGameData, PixiMapData, PixiTurnData} from "./PixiGameData";
import {TerrainType} from "../pixi/SpriteFactories";
import * as PIXI from "pixi.js";

class ProtobufBackedUIMapData implements PixiMapData {

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

class PrecalculatedTurnData implements PixiTurnData {

    constructor(
        private readonly turnNr: number,
        private readonly hero: PIXI.IPointData,
        private readonly visible: PIXI.IPointData[],
        private readonly observed: PIXI.IPointData[],
    ) {}

    getObserved(): PIXI.IPointData[] {
        return this.observed
    }

    getHero(): PIXI.IPointData {
        return this.hero
    }

    getVisible(): PIXI.IPointData[] {
        return this.visible
    }

}

function calculateVisibility(center: PIXI.IPointData, radius: number) {
    const visiblePoints: PIXI.IPointData[] = [];
    const radius2 = radius * radius

    for (let x = center.x - radius; x <= center.x + radius; x++) {
        for (let y = center.y - radius; y <= center.y + radius; y++) {
            let dx = x - center.x
            dx = dx * dx
            let dy = y - center.y
            dy = dy * dy
            if (dx + dy <= radius2) {
                visiblePoints.push({x: x, y: y})
            }
        }
    }

    return visiblePoints;
}

function toPixiPoint(coord: Coordinate): PIXI.IPointData {
    return {x: coord.getX(), y: coord.getY()}
}

class IPointDataSet {
    private readonly pointMap: Map<string, PIXI.IPointData> = new Map()

    addAll(points: PIXI.IPointData[]) {
       for (const point of points) {
           this.pointMap.set(JSON.stringify(point), point)
       }
    }

    values(): PIXI.IPointData[] {
        const result: PIXI.IPointData[] = []
        this.pointMap.forEach(point => result.push(point))
        return result
    }
}

export class ProtobufBackedUIGameData implements PixiGameData {

    private readonly turnStates: PixiTurnData[] = []

    constructor(private readonly pb: GameData) {
        const observedPoints = new IPointDataSet()

        for(let i=0; i<pb.getTurnsList().length; i++) {
            const heroCoord = pb.getTurnsList()[i].getHero();
            if (!heroCoord) throw new Error("no hero data at " + heroCoord)
            const heroPoint = toPixiPoint(heroCoord)
            const visiblePoints = calculateVisibility(heroPoint, pb.getVisibilityradius());
            observedPoints.addAll(visiblePoints)
            this.turnStates.push(new PrecalculatedTurnData(i, heroPoint, visiblePoints, observedPoints.values()))
        }
    }

    getMap(): PixiMapData {
        return new ProtobufBackedUIMapData(this.pb.getMapList())
    }

    getTurnCount(): number {
        return this.pb.getTurnsList().length;
    }

    getTurnState(turnNr: number): PixiTurnData {
        return this.turnStates[turnNr]
    }

}
