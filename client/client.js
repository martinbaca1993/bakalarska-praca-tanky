var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true, 
            gravity: { x: 0 , y: 0 }
        }
    },
    scene: [SetNameScene, MenuScene, HighscoreScene, WaitingScene, GameScene, GameOverScene]
}; 


var game = new Phaser.Game(config);
game.socket = io();


