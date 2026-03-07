import "phaser";
import { Bird } from "./types/Bird";
export class GameScene extends Phaser.Scene {
    private elastic!: MatterJS.ConstraintType;
    private birds: Bird[] = [];
    private bird!: Bird;
    private mouseSpring!: any;
    private isLaunched = false;
    private currentBirdIndex = 0;

    private readonly anchor = { x: 300, y: 800 };

    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image('Red', 'images/Red.png');
        this.load.image('Chuck', 'images/chuck.png');
        this.load.image('Stella', 'images/stella.png');


    }

    create() {
        const Red = new Bird(this, this.anchor.x, this.anchor.y, 'Red', this.anchor);
        const Chuck = new Bird(this, this.anchor.x, this.anchor.y, 'Chuck', this.anchor);
        Chuck.setScale(0.17)
        const Stella = new Bird(this, this.anchor.x, this.anchor.y, 'Stella', this.anchor);
        Stella.setScale(0.2)

        this.birds.push(Red, Chuck, Stella);
        this.birds.forEach((b, index) => {
            if (index === 0) {
                b.setStatic(false);
                b.setIgnoreGravity(true);
                b.setInteractive();
            } else {
                b
                b.setStatic(true); // Bloqueados en la fila
                b.setPosition(this.anchor.x - (index * 100) - 20, 1000);
            }
        });
        this.bird = this.birds[0];

        this.mouseSpring = this.matter.add.mouseSpring({
            length: 1,
            stiffness: 0.1
        })
        this.elastic = this.matter.add.constraint(
            this.bird.body as MatterJS.BodyType,
            this.anchor as any,
            0,
            0.1, {
            pointB: { x: this.anchor.x, y: this.anchor.y },
            render: { visible: true, lineColor: 0x5d3a1a, lineThickness: 4 }
        });


        this.input.on('pointerup', () => {
            if (this.bird.x < this.anchor.x && !this.isLaunched) {
                this.isLaunched = true;
                (this.mouseSpring as any).constraint.bodyB = null;
                this.bird.launch();
                this.time.delayedCall(2000, () => this.nextBird());
            }

        });
        this.events.on('update', () => {
            this.bird.checkBoundary(this.elastic);
        })

        this.matter.add.rectangle(960, 1050, 1920, 60, { isStatic: true });

        for (let i = 0; i < 5; i++) {
            this.matter.add.rectangle(1200, 970 - i * 85, 80, 80, {
                restitution: 0.3,
                friction: 0.5
            });

        }
    }
    private nextBird() {
        this.currentBirdIndex++

        if (this.currentBirdIndex < this.birds.length) {
            const nextBird = this.birds[this.currentBirdIndex];

            nextBird.setStatic(false);
            nextBird.setIgnoreGravity(true);
            this.tweens.add({
                targets: nextBird,
                x: this.anchor.x,
                y: this.anchor.y,
                duration: 600,
                ease: 'Back.easeOut',
                onUpdate: () => {
                    nextBird.setPosition(nextBird.x, nextBird.y);
                },
                onComplete: () => {
                    this.bird = nextBird;
                    this.bird.setInteractive();
                    this.isLaunched = false;

                    if (this.bird.body) {

                        this.elastic.bodyB = this.bird.body as MatterJS.BodyType;
                        this.elastic.render.visible = true;
                        this.mouseSpring.constraint.bodyB = this.bird.body as MatterJS.BodyType;
                    }
                }
            })
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1920,
    height: 1080,
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 1 },
            debug: true,
        }
    },
    scene: GameScene,
};

new Phaser.Game(config);
