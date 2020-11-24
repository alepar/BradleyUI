import * as PIXI from 'pixi.js'

export class Character {

    readonly container = new PIXI.Container()

    private src: PIXI.IPointData = {x:0, y:0}
    private dst: PIXI.IPointData = {x:0, y:0}

    private up: PIXI.AnimatedSprite
    private down: PIXI.AnimatedSprite
    private left: PIXI.AnimatedSprite
    private right: PIXI.AnimatedSprite
    private idle: PIXI.AnimatedSprite
    private all: PIXI.AnimatedSprite[] = []

    constructor(sheet: PIXI.Spritesheet, charName: string) {
        this.up = this.createAnimatedSprite(sheet.animations[`${charName}/walk/up`])
        this.down = this.createAnimatedSprite(sheet.animations[`${charName}/walk/down`])
        this.left = this.createAnimatedSprite(sheet.animations[`${charName}/walk/side`])
        this.right = this.createAnimatedSprite(sheet.animations[`${charName}/walk/side`])
        this.idle = this.createAnimatedSprite(sheet.animations[`${charName}/idle`])

        this.left.scale.x = -1
        this.left.position.x = 16

        this.idle.visible = true
    }

    setCoordinates(src: PIXI.IPointData, dst: PIXI.IPointData) {
        this.src = src
        this.dst = dst
        this.updateSprite()
    }

    updateTween(fract: number) {
        const src = this.src;
        const dst = this.dst;

        const vx = dst.x - src.x
        const vy = dst.y - src.y

        this.container.position.set(
            16 * (src.x + vx * fract),
            16 * (src.y + vy * fract),
        )
    }

    private updateSprite() {
        const src = this.src;
        const dst = this.dst;

        const vx = dst.x - src.x
        const vy = dst.y - src.y

        if (vx === 0 && vy === 0) {
            this.setVisible(this.idle)
        } else if (vx === 0) {
            if (vy > 0) {
                this.setVisible(this.down)
            } else {
                this.setVisible(this.up)
            }
        } else {
            // vy === 0 OR diagonal move
            if (vx > 0) {
                this.setVisible(this.right)
            } else {
                this.setVisible(this.left)
            }
        }
    }

    private setVisible(sprite: PIXI.AnimatedSprite) {
        for (const sprite of this.all) {
            sprite.visible = false
        }
        sprite.visible = true
    }

    private createAnimatedSprite(animation: any): PIXI.AnimatedSprite {
        const sprite = new PIXI.AnimatedSprite(animation)
        sprite.animationSpeed = 0.1
        sprite.play()
        sprite.visible = false
        this.container.addChild(sprite)
        this.all.push(sprite)
        return sprite;
    }

}