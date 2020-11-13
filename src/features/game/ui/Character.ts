import * as PIXI from 'pixi.js'

export class Character {

    readonly container = new PIXI.Container()

    private vx: number = 0
    private vy: number = 0

    walkSpeed: number

    private up: PIXI.AnimatedSprite
    private down: PIXI.AnimatedSprite
    private left: PIXI.AnimatedSprite
    private right: PIXI.AnimatedSprite
    private idle: PIXI.AnimatedSprite
    private all: PIXI.AnimatedSprite[] = []

    constructor(sheet: PIXI.Spritesheet, charName: string, walkSpeed: number = 1) {
        this.walkSpeed = walkSpeed

        this.up = this.createAnimatedSprite(sheet.animations[`${charName}/walk/up`])
        this.down = this.createAnimatedSprite(sheet.animations[`${charName}/walk/down`])
        this.left = this.createAnimatedSprite(sheet.animations[`${charName}/walk/side`])
        this.right = this.createAnimatedSprite(sheet.animations[`${charName}/walk/side`])
        this.idle = this.createAnimatedSprite(sheet.animations[`${charName}/idle`])

        this.left.scale.x = -1
        this.left.position.x = 16

        this.idle.visible = true
    }

    setv(vx: number, vy: number) {
        this.vx = vx * this.walkSpeed
        this.vy = vy * this.walkSpeed

        this.updateSprite()
    }

    step() {
        this.container.x += this.vx
        this.container.y += this.vy
    }

    private updateSprite() {
        if (this.vx === 0 && this.vy === 0) {
            this.setVisible(this.idle)
        } else if (this.vx === 0) {
            if (this.vy > 0) {
                this.setVisible(this.down)
            } else {
                this.setVisible(this.up)
            }
        } else if (this.vy === 0) {
            if (this.vx > 0) {
                this.setVisible(this.right)
            } else {
                this.setVisible(this.left)
            }
        } else {
            throw new Error("diagonal velocity not supported")
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