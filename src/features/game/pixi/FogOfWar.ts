import * as PIXI from 'pixi.js'

export class FogOfWar {

    readonly container: PIXI.Container

    private readonly visibleGraphics: PIXI.Graphics
    private readonly observedGraphics: PIXI.Graphics

    constructor() {
        this.visibleGraphics = new PIXI.Graphics()
        this.observedGraphics = new PIXI.Graphics()

        this.container = new PIXI.Container()

        const visibleLayer = new PIXI.Container()
        visibleLayer.alpha = 0.25
        visibleLayer.addChild(this.visibleGraphics)

        const observedLayer = new PIXI.Container()
        observedLayer.alpha = 0.5
        visibleLayer.addChild(this.observedGraphics)

        this.container.addChild(visibleLayer)
        this.container.addChild(observedLayer)
        this.container.filters = [new PIXI.filters.BlurFilter(15)];
    }

    // TODO https://pixijs.io/examples/#/sprite/tiling-sprite.js
    update(mapSize: PIXI.IPointData, visible: PIXI.IPointData[], observed: PIXI.IPointData[]) {
        const visibleGraphics = this.visibleGraphics
        const observedGraphics = this.observedGraphics

        visibleGraphics.clear()
        observedGraphics.clear()

        this.renderFog(visibleGraphics, mapSize, visible);
        this.renderFog(observedGraphics, mapSize, observed);
    }

    private renderFog(visibleGraphics: PIXI.Graphics, mapSize: PIXI.IPointData, holePoints: PIXI.IPointData[]) {
        visibleGraphics.beginFill(0x000000);
        visibleGraphics.drawRect(-100000, -100000, mapSize.x * 16 + 200000, mapSize.y * 16 + 200000);

        visibleGraphics.beginHole();
        for (const p of holePoints) {
            visibleGraphics.drawRect(p.x * 16, p.y * 16, 15, 15);
        }
        visibleGraphics.endHole();

        visibleGraphics.endFill();
    }
}