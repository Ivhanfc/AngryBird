import "phaser";

export class Bird extends Phaser.Physics.Matter.Image {
    private isLaunched: boolean = false;
    private anchor: { x: number, y: number };

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, anchor: { x: number, y: number }) {
        super(scene.matter.world, x, y, texture);
        this.anchor = anchor;
        scene.add.existing(this);

        this.setScale(0.05);
        this.setMass(1);
        this.setFrictionAir(0.01);
        this.setCircle(this.displayWidth / 2);
        this.setStatic(false);
        this.setIgnoreGravity(true);
    }
    public launch() {
        if (this.isLaunched) return;
        this.isLaunched = true;
        this.setStatic(false);
        this.setIgnoreGravity(false);

        if (this.body) {
            (this.body as any).isSleeping = false;
        }
    }

    public checkBoundary(elastic: MatterJS.ConstraintType) {
        if (this.isLaunched && elastic && elastic.render.visible) {
            if (this.x >= this.anchor.x) {
                this.scene.matter.world.removeConstraint(elastic);
                elastic.render.visible = false;
            }
        }
    }
    public reset(x: number, y: number) {
        this.isLaunched = false;
        this.setStatic(true);
        this.setIgnoreGravity(true);
        this.scene.matter.body.setPosition(this.body as MatterJS.BodyType, { x, y });
        this.setVelocity(0, 0);
        this.setAngularVelocity(0);
        this.setRotation(0);
    }
    public getLaunchedStatus(): boolean {
        return this.isLaunched;
    }
}
