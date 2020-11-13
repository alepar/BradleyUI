import * as PIXI from 'pixi.js'

export interface CornerSpriteFactory<T> {
    create(nw: T, ne: T, se: T, sw: T): PIXI.AnimatedSprite
}

export enum TerrainType {
    GRASS,
    WATER,
}

export class OverworldTerrainSpriteFactory implements CornerSpriteFactory<TerrainType> {

    spritesheet: PIXI.Spritesheet

    constructor(sheet: PIXI.Spritesheet) {
        this.spritesheet = sheet
    }

    create(nw: TerrainType, ne: TerrainType, se: TerrainType, sw: TerrainType): PIXI.AnimatedSprite {
        let spriteName = `water/${nw}${ne}${se}${sw}`
        const frames = this.spritesheet.animations[spriteName];
        if (!frames) {
            throw new Error(`could not load sprite ${spriteName}`);
        }
        const sprite = new PIXI.AnimatedSprite(frames);
        sprite.animationSpeed = 0.05;
        sprite.play()

        return sprite
    }

}
