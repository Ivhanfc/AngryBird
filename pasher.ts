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
        this.load.image('Box', 'images/box.png');
        this.load.image('Pig', 'images/pig.png');


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


        this.createTower(1400, 950);
        this.createTower(1800, 400);
        this.createPig(1730, 950);
        this.createPig(1830, 400);
        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const { bodyA, bodyB } = pair;
                const checkAndDestroy = (body: MatterJS.BodyType) => {
                    if (body.gameObject && (body as any).label === 'pig') {
                        this.tweens.add({
                            targets: body.gameObject,
                            scale: 0,
                            alpha: 0,
                            duration: 200,

                            onComplete: () => {
                                body.gameObject?.destroy();
                                this.matter.world.remove(body);
                            }
                        });
                    }
                };
                checkAndDestroy(bodyA);
                checkAndDestroy(bodyB);
            });
        });

    }
    private nextBird() {
        this.currentBirdIndex++

        if (this.currentBirdIndex < this.birds.length) {
            const nextBird = this.birds[this.currentBirdIndex];

            nextBird.setStatic(false);
            nextBird.setIgnoreGravity(true);
            nextBird.setVelocity(0, 0);
            nextBird.setAngularVelocity(0);
            nextBird.setRotation(0);

            nextBird.setPosition(this.anchor.x, this.anchor.y);

            this.bird = nextBird;
            this.bird.setInteractive();
            this.isLaunched = false;

            if (this.bird.body) {
                this.matter.body.setPosition(this.bird.body as MatterJS.BodyType, { x: this.anchor.x, y: this.anchor.y });
                this.elastic.bodyA = this.bird.body as MatterJS.BodyType;
                this.elastic.pointA = { x: 0, y: 0 };
                this.elastic.render.visible = true;
                this.time.delayedCall(50, () => {
                    this.matter.world.removeConstraint(this.mouseSpring.constraint);

                    this.mouseSpring = this.matter.add.mouseSpring({
                        length: 1,
                        stiffness: 0.1
                    });
                    this.elastic = this.matter.add.constraint(
                        this.bird.body as MatterJS.BodyType,
                        this.anchor as any,
                        0,
                        0.1, {
                        pointB: { x: this.anchor.x, y: this.anchor.y },
                        render: { visible: true, lineColor: 0x5d3a1a, lineThickness: 4 }
                    });
                    this.bird.setAwake();
                });
            }
        } else {
            console.log("¡No hay más pajaritos!");
            this.elastic.render.visible = false;
        }
    }
    private createTower(startX: number, startY: number) {
        const boxWidth = 60;
        const boxHeight = 100;
        const rows = 4;
        const cols = 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = startX + (j * boxWidth);
                const y = startY - (i * boxHeight);

                const box = this.matter.add.image(x, y, 'Box', undefined, {
                    restitution: 0.4,
                    friction: 0.5,
                    density: 0.005
                });
                box.setScale(0.1);



            }
        }
    }
    private createPig(x: number, y: number) {
        const pig = this.matter.add.image(x, y, 'Pig', undefined, {
            shape: 'circle',
            restitution: 0.5,
            friction: 0.1,
        });
        pig.setScale(0.4)
        pig.setDisplaySize(60, 60);
        (pig.body as MatterJS.BodyType).label = 'pig';
        return pig;
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
