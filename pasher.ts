import "phaser";

export class GameScene extends Phaser.Scene {
    private pajaro: any;
    constructor() {
        super({ key: "GameScene" });
    }
    preload() {
        this.load.image('pajaro', 'images/Red.png');

    }
    create() {

        this.pajaro = this.physics.add.sprite(20, 20, 'pajaro');
        this.pajaro.setScale(0.04);

        this.pajaro.body.setCollideWorldBounds(true);
        this.pajaro.body.setBounce(0.5);

        this.add.text(100, 100, "ANGRY BIRDS!", { color: "#ffffff" });
    }

}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 800,
    physics:
    {
        default: 'arcade',
        arcade: {
            gravity: { x: 100, y: 600 },
            debug: true,
        }
    },
    height: 600,
    scene: GameScene,
};

new Phaser.Game(config);


