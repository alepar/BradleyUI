import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <div id="pixi"/>
      {/*<App />*/}
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// Setup PIXI app
const app = new PIXI.Application({
    width: 1400,
    height: 900,
    transparent: false,
    antialias: true,
    backgroundColor: 0x5a81dd,
})

document.getElementById('pixi')?.appendChild(app.view);

interface CornerSpriteFactory<T> {
    create(nw: T, ne: T, se: T, sw: T): PIXI.AnimatedSprite
}

class SimpleSpriteFactory implements CornerSpriteFactory<number> {

    spritesheet: PIXI.Spritesheet

    constructor(sheet: PIXI.Spritesheet) {
        this.spritesheet = sheet
    }

    create(nw: number, ne: number, se: number, sw: number): PIXI.AnimatedSprite {
        this.check(nw)
        this.check(ne)
        this.check(se)
        this.check(sw)

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

    check(sw: number) {
        if (sw !== 0 && sw !== 1) {
            throw new Error(`wrong number ${sw}`);
        }
    }

}

/*const stringmap = [
    ".....X...",
    ".....X...",
    "..XXXX...",
    ".XX......",
    ".X.......",
    ".X.......",
    ".X.......",
    ".........",
]*/
/*
const stringmap = [
"......X...",
"......X...",
"...XXXX...",
"..XX......",
"..X.......",
"..X.......",
"..X.......",
"..........",
"..........",
]
*/
/*
const stringmap = [
    "....XXXX",
    "..XXX..X",
    "..XXXX.X",
    ".XXXX..X",
    "XXXXXX.X",
    ".XXXX..X",
    "..XXXX.X",
    "..XXX..X",
    "....XXXX",
]
*/

const stringmap = [
    "X....XXXXXXXXXXXXXXXXXXXX",
    "XX.....XXXXXXXXXXXXXX...X",
    "XX.....XXXXXXXXXXXXX...XX",
    "X....XXXX.XXXXXXXXXXXXXXX",
    "XXX....XX....X..X.......X",
    "XX.....XX................",
    "X.....XXX................",
    ".......XXX...............",
    ".....XXXX................",
    "X......XXXX..............",
    "XXXXXXXXXXXXXXXX..XXXX..X",
    "XXXXXXXXXXXXXXX....XX....",
    "XXXXXXXXXXXXXXXXXXXXXXXXX",
]

class StringBackedMap {

    stringmap: string[]
    size: PIXI.IPointData;

    constructor(arr: string[]) {
        this.stringmap = arr

        let x = 0
        for (let y=0; y<arr.length; y++) {
            const row = arr[y]
            if (row.length > x) {
                x = row.length
            }
        }

        this.size = {x: x, y: arr.length}
    }

    get(x: number, y: number) {
        if (y<0 || y >= this.stringmap.length) {
            return 1
        }

        const row = this.stringmap[y]

        if (x<0 || x >= row.length) {
            return 1
        }

        switch (row[x]) {
            case 'X': return 1
            case '.': return 0
            default: throw new Error("unknown literal in map")
        }
    }
}

// load the texture we need
app.loader
    .add('overworld', 'overworld.json')
    .load((loader, resources) => {
        const overworld = resources.overworld?.spritesheet
        if (!overworld) throw new Error("could not load overworld texture atlas");


        // create viewport
        const viewport = new Viewport({
            screenWidth: 1400,//window.innerWidth,
            screenHeight: 900,//window.innerHeight,
            // worldWidth: 16*30,
            // worldHeight: 16*15,

            interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        // add the viewport to the stage
        app.stage.addChild(viewport)

        // activate plugins
        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()
            // .bounce()
        viewport
            .scale.set(3, 3)

        const waterSpriteFactory = new SimpleSpriteFactory(overworld)
        const map = new StringBackedMap(stringmap)

        const terrain = new PIXI.Container()
        viewport.addChild(terrain)

        for (let x=0; x < map.size.x+1; x++) {
            for (let y=0; y < map.size.y+1; y++) {
                console.log(`${x} ${y}`)
                const sprite = waterSpriteFactory.create(map.get(x-1, y-1), map.get(x, y-1), map.get(x, y), map.get(x-1, y))
                sprite.position.set(x*16, y*16)

                terrain.addChild(sprite)
            }
        }

        const grid = new PIXI.Container()
        grid.position.set(8, 8)
        viewport.addChild(grid)
        for (let x=1; x < map.size.x; x++) {
            const line = new PIXI.Graphics();
            line.lineStyle(1, 0xFFFFFF, 0.15);
            line.moveTo(x*16, 0);
            line.lineTo(x*16, 16*map.size.y);
            grid.addChild(line);
        }
        for (let y=1; y < map.size.y; y++) {
            const line = new PIXI.Graphics();
            line.lineStyle(1, 0xFFFFFF, 0.15);
            line.moveTo(0, y*16);
            line.lineTo(16*map.size.x, y*16);
            grid.addChild(line);
        }


        const hero = new Character(overworld, "character/hero");
        grid.addChild(hero.container)

        hero.goRight()

        // Listen for frame updates
        app.ticker.add(() => {
            hero.step()

            if (hero.container.x > 4*16) {
                hero.container.x = 4*16
                hero.goDown()
            } else if (hero.container.y > 4*16) {
                hero.container.y = 4*16
                hero.goLeft()
            } else if (hero.container.x < 0) {
                hero.container.x = 0
                hero.goUp()
            } else if (hero.container.y < 0) {
                hero.container.y = 0
                hero.goRight()
            }
        });
});

class Character {

    container = new PIXI.Container()
    vx: number = 0
    vy: number = 0

    private walkSpeed = 1

    private up: PIXI.AnimatedSprite
    private down: PIXI.AnimatedSprite
    private left: PIXI.AnimatedSprite
    private right: PIXI.AnimatedSprite
    private idle: PIXI.AnimatedSprite
    private all: PIXI.AnimatedSprite[] = []

    constructor(sheet: PIXI.Spritesheet, path: string) {
        this.up = this.createAnimatedSprite(sheet.animations[`${path}/walk/up`])
        this.down = this.createAnimatedSprite(sheet.animations[`${path}/walk/down`])
        this.left = this.createAnimatedSprite(sheet.animations[`${path}/walk/side`])
        this.right = this.createAnimatedSprite(sheet.animations[`${path}/walk/side`])
        this.idle = this.createAnimatedSprite(sheet.animations[`${path}/idle`])

        this.left.scale.x = -1
        this.left.position.x = 16

        this.idle.visible = true
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

    goDown() {
        this.vx = 0
        this.vy = this.walkSpeed
        this.updateSprite()
    }

    goLeft() {
        this.vx = -this.walkSpeed
        this.vy = 0
        this.updateSprite()
    }

    goUp() {
        this.vx = 0
        this.vy = -this.walkSpeed
        this.updateSprite()
    }

    goRight() {
        this.vx = this.walkSpeed
        this.vy = 0
        this.updateSprite()
    }

    goIdle() {
        this.vx = 0
        this.vy = 0
        this.updateSprite()
    }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
